import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { notificationService } from '../Services/notification.service';
import { ListItem, Avatar, Icon } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import SnackBar from 'react-native-snackbar-component';

export default class NotificationsScreen extends React.Component {
  static navigationOptions = { title: 'Notifications' };

  constructor(props) {
    super(props);

    this.viewabilityConfigCallbackPairs = [{
      viewabilityConfig: {
        waitForInteraction: false,
        itemVisiblePercentThreshold: 95,
        minimumViewTime: 2500
      },
      onViewableItemsChanged: this.markViewableItemsAsViewed
    }]

    this.state = {
      notifications: null,
      refreshing: false,
    };

    this.getNotifications = this.getNotifications.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.getNotifications(0);
  }

  async getNotifications(offset) {
    if (this.state.error) this.setState({ error: null });

    try {
      const { data } = await notificationService.getNotifications(offset || 0);
      this.setState({ notifications: data });
    } catch(err) {
      this.setState({ error: 'There was a problem getting your notifications.' });
      throw(err);
    }
  }

  async handleScroll(offset) {
    if (offset > 15) {
      try {
        const { data } = await notificationService.getNotifications(offset);
        this.setState({ notifications: this.state.notifications.concat(data) });
      } catch(err) {
        this.setState({ error: 'There was a problem getting your notifications.' });
        throw(err);
      }
    }
  }

  _renderNotification({ item }) {
    const { action_type } = item;
    // TODO: action_type === comment ? Should prob navigate to CommentsScreen
      // Right now, the problem is that the comment screen requires incrementCommentCount as a prop.
    // const navRoute = action_type === 'like' ? 'EventDetails' : 'Comments';

    return (
      <ListItem
        title={`${item.username || item.name} ${action_type === 'like' ? 'liked' : 'commented on'} your event.`}
        titleStyle={{ fontSize: 12 }}
        subtitle={new Date(item.created_at).toISOString().substring(0, 10)}
        subtitleStyle={{ fontSize: 10, color: 'grey'}}
        leftAvatar={
          <Avatar
            size="small"
            source={item.profile_image ? { uri: item.profile_image } : null}
            icon={{name: 'person', size: 20}}
            activeOpacity={0.7}
          />
        }
        rightAvatar={
          <Avatar
            size="small"
            rounded
            source={{ uri: item.event_image }}
            source={item.event_image ? { uri: item.event_image } : null}
            icon={{name: 'chat-bubble-outline', size: 20}}
            activeOpacity={0.7}
          />
        }
        onPress={() => this.props.navigation.navigate('EventDetails', { eventId: item.event_id })}
        chevron
      />
    );
  }

  markViewableItemsAsViewed({ viewableItems }) {
    const notificationIds = viewableItems.map(vi => vi.item.id);
    notificationService.markNotificationsViewed(notificationIds);
  }

  render() {
    const { notifications, refreshing, error } = this.state;

    if (error) {
      return(
        <View style={{flex: 1}}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              size={36}
              name='refresh'
              color={PRIMARY_DARK_COLOR}
              onPress={() => this.getNotifications()}
            />
          </View>
          <SnackBar
            visible={error ? true : false}
            textMessage={error}
            actionHandler={() => this.setState({ error: null })}
            actionText="close"
          />
        </View>
      );
    }

    return(
      <View style={styles.constainer}>
        { notifications && notifications.length ?
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={notifications}
            renderItem={this._renderNotification.bind(this)}
            onEndReached={ () => this.handleScroll(notifications.length)}
            onEndReachedThreshold={0}
            viewabilityConfigCallbackPairs={this.viewabilityConfigCallbackPairs}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.getNotifications}
              />
            }
          />
        : 
          <Text style={{alignSelf: 'center'}}> There are no notifcations to display. </Text>
        }   
      </View>
    )
  }
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
  }
});
