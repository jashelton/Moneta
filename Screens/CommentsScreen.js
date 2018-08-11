import React from 'react';
import { View, ScrollView, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { ListItem, Button, Divider } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';

import { commentsService, notificationService } from '../Services';
import { authHelper } from '../Helpers';

export default class CommentsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      event: null,
      comments: [],
      newComment: '',
      userData: {}
    };

    this.createComment = this.createComment.bind(this);
  }

  async componentDidMount() {
    const event = this.props.navigation.getParam('event', null);
    this.setState({ event });

    const { data } = await commentsService.getComments(event.id);
    this.setState({comments: data});

    const userData = await authHelper.getParsedUserData();
    this.setState({userData});
  }

  async createComment() {
    let { event, newComment, comments, userData } = this.state;
    const { data } = await commentsService.createComment(event.id, newComment);
    comments.push(data.comment);

    await notificationService.sendPushNotification(
      event.user_id, // Send to
      `${userData.first_name} ${userData.last_name} has commented on your event.`, // Title
      newComment // Body
    );

    newComment = '';
    this.setState({comments, newComment});
    // Call back to EventDetailsScreen to increment the comment count.  This will need to be updated once delete comment is avail.
    await this.props.navigation.state.params.incrementCommentCount();
  }

  render() {
    const { comments, newComment, userData } = this.state;
    return(
      <KeyboardAvoidingView style={styles.container} behavior='padding'>
        { comments.length ?
          <ScrollView style={styles.commentsContainer}>
            {comments.length && comments.map((comment, i) => (
              <ListItem
                key={i}
                title={comment.text}
                subtitle={`${userData.first_name} ${userData.last_name}`}//TODO: Make this real... data is an storage... may as well use profile image as well.
                subtitleStyle={{fontSize: 12, color: 'grey'}}
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
})