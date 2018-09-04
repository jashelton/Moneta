import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import { connect } from 'react-redux';
import { clearErrors, updateEventDetailsLikes } from '../reducer'
import { authHelper } from '../Helpers';
import { notificationService } from '../Services';

class SocialComponent extends React.Component {

  async favoriteEvent() {
    const { event, updateEventDetailsLikes } = this.props;
    const currentUserId = await authHelper.getCurrentUserId();

    // If event has been disliked... needs to change for readability.
    if (event.liked) {
      notificationService.deleteNotification(event.id, event.user_id, 'like');
    }

    try {
      const response = await updateEventDetailsLikes(event.id, event.liked, 'activity');
      if (response.error) throw(response.error);

    } catch(err) {
      throw(err);
    }

    // If event has been liked and the creator isn't the current user, send necessary notifications.
    if (!event.liked && event.user_id !== currentUserId) {
      this.notify();
    }
  }

  async notify() {
    const { event } = this.props;

    await notificationService.sendPushNotification(event.user_id, `Someone liked your ${event.event_type}!`, event.title || event.description);
    notificationService.createNotification(event.id, event.user_id, 'like');
  }

  render() {
    const { event } = this.props;

    return (
      <View style={styles.container}>
        <Divider />
        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              color='#fb3958'
              name={!event.liked ? 'favorite-border' : 'favorite'}
              containerStyle={styles.iconContainer}
              onPress={() => this.favoriteEvent()}
            />
            <Text>{event.likes_count}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{event.comment_count}</Text>
            <Icon
              style={styles.rightIcon}
              color='#fb3958'
              name='comment'
              containerStyle={styles.iconContainer}
              onPress={() => this.props.navigation.navigate('Comments', { event: event, incrementCommentCount: this.incrementCommentCount.bind(this) })}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  },
  iconContainer: {
    padding: 5
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  updateEventDetailsLikes,
  clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(SocialComponent);
