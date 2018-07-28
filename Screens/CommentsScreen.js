import React from 'react';
import { View, ScrollView, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { ListItem, Button, Divider } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';

import { commentsService } from '../Services';
import { authHelper } from '../Helpers';

export default class CommentsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventId: null,
      comments: [],
      newComment: '',
      userData: {}
    };

    this.createComment = this.createComment.bind(this);
  }

  async componentDidMount() {
    const eventId = this.props.navigation.getParam('eventId', null);
    this.setState({eventId});

    const { data } = await commentsService.getComments(eventId);
    this.setState({comments: data});

    const userData = await authHelper.getParsedUserData();
    this.setState({userData});
  }

  async createComment() {
    let { eventId, newComment, comments } = this.state;
    const { data } = await commentsService.createComment(eventId, newComment);

    comments.push(data.comment);
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