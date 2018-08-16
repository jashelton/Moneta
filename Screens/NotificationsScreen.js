import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { notificationService } from '../Services/notification.service';
import { ListItem, Avatar } from 'react-native-elements';

export default class NotificationsScreen extends React.Component {
  static navigationOptions = { title: 'Notifications' };

  constructor(props) {
    super(props);

    this.state = {
      notifications: null,
      refreshing: false,
    };

    this.getNotifications = this.getNotifications.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    this.getNotifications(0);
  }

  async getNotifications(offset) {
    const { data } = await notificationService.getNotifications(offset);
    this.setState({ notifications: data });
  }

  async handleScroll(offset) {
    if (offset > 15) {
      const { data } = await notificationService.getNotifications(offset);
      this.setState({ notifications: this.state.notifications.concat(data) });
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
            activeOpacity={0.7}
          />
        }
        onPress={() => this.props.navigation.navigate('EventDetails', { eventId: item.event_id })}
        chevron
      />
    );
  }

  render() {
    const { notifications, refreshing } = this.state;

    return(
      <View style={styles.constainer}>
        { notifications && notifications.length ?
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={notifications}
            renderItem={this._renderNotification.bind(this)}
            onEndReached={ () => this.handleScroll(notifications.length)}
            onEndReachedThreshold={0}
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
