import React from 'react';
import { View, ScrollView, Text, StyleSheet, KeyboardAvoidingView, RefreshControl, ActivityIndicator, AppState } from 'react-native';
import { ListItem, Button, Divider, Avatar } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import SnackBar from 'react-native-snackbar-component'

import { commentsService, notificationService } from '../Services';
import { authHelper } from '../Helpers';

export default class CommentsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      event: null,
      comments: [],
      newComment: '',
      refreshing: false,
      currentUserId: null,
      appState: AppState.currentState,
      snackbarError: null
    };

    this.createComment = this.createComment.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    const event = this.props.navigation.getParam('event', null);
    const currentUserId = await authHelper.getCurrentUserId();
    this.setState({ event, currentUserId });

    this.getComments(event);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = async (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.getComments();
    }
    this.setState({appState: nextAppState});
  }

  async getComments() {
    const { event } = this.state;

    try {
      const { data } = await commentsService.getComments(event.id);
      this.setState({comments: data});
    } catch(err) {
      this.setState({ snackbarError: 'There was a problem loading the comments.'});
      throw new Error(err);
    }
  }

  async createComment() {
    let { event, newComment, comments, currentUserId } = this.state;

    try {
      const { data } = await commentsService.createComment(event.id, newComment);
      comments.push(data.newComment);

      newComment = '';
      this.setState({comments, newComment});
      // Call back to EventDetailsScreen to increment the comment count.  This will need to be updated once delete comment is avail.
      await this.props.navigation.state.params.incrementCommentCount();

      if (event.user_id !== currentUserId) {
        this.notify(data.newComment);
      }
    } catch(err) {
      this.setState({ snackbarError: 'There was a problem adding your comment.'});
      throw new Error(err);
    }
  }

  async notify(comment) {
    const { event } = this.state;
    // Send push notification to owner of the event.
    await notificationService.sendPushNotification(
      event.user_id, // Send to
      `${comment.name || comment.username} has commented on your event.`, // Title
      comment.text // Body
    );

    // Create notification in notifications table of type 'comment'
    notificationService.createNotification(event.id, event.user_id, 'comment');
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.getComments();
    this.setState({ refreshing: false });
  }

  render() {
    const { comments, newComment, refreshing } = this.state;

    return(
      <KeyboardAvoidingView style={styles.container} behavior='padding'>
        { comments.length ?
          // TODO: Convert to FlatList
          //   Should display from the bottom up with limited comments displayed.
          <ScrollView
            style={styles.commentsContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            {comments.length && comments.map((comment, i) => (
              <ListItem
                key={i}
                title={comment.text}
                subtitle={comment.username || comment.name}
                subtitleStyle={{fontSize: 12, color: 'grey'}}
                leftAvatar={
                  <Avatar
                    size="small"
                    rounded
                    source={comment.profile_image ? {uri: comment.profile_image} : null}
                    icon={{name: 'person', size: 20}}
                    activeOpacity={0.7}
                  />
                }
              />
            ))}
          </ScrollView>
          :
          <View style={[styles.commentsContainer, styles.emptyContainer]}>
            <Text>There are currently no comments for this event.</Text>
          </View>
        }
        <Divider />
        <View style={styles.newCommentContainer}>
          <TextField
            value={newComment}
            onChangeText={(newComment) => this.setState({ newComment })}
            returnKeyType='done'
            multiline={true}
            blurOnSubmit={true}
            label='Comment'
            characterRestriction={140}
          />
          <Button style={styles.btnSubmit} title='Submit' onPress={this.createComment} />
        </View>

        <SnackBar
          visible={this.state.snackbarError ? true : false}
          textMessage={this.state.snackbarError}
          actionHandler={() => this.setState({ snackbarError: null })}
          actionText="close"
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  rightIcon: {
    marginRight: 15
  },
  commentsContainer: {
    height: '70%',
  },
  newCommentContainer: {
    height: '30%',
    padding: 15
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
