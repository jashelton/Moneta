import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { notificationService } from '../Services/notification.service';
import { ListItem } from 'react-native-elements';

export default class NotificationsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notifications: null,
      refreshing: false,
    };

    this.getNotifications = this.getNotifications.bind(this);
  }

  async componentDidMount() {
    this.getNotifications();
  }

  async getNotifications() {
    const { data } = await notificationService.getNotifications();
    this.setState({ notifications: data });
  }

  _renderNotification({ item }) {
    return (
      <ListItem
        title={`${item.username || item.name} ${item.action_type === 'like' ? 'liked' : 'commented on'} your event.`}
        titleStyle={{ fontSize: 12 }}
        subtitle={new Date(item.created_at).toISOString().substring(0, 10)}
        subtitleStyle={{ fontSize: 10, color: 'grey'}}
        leftAvatar={{ source: { uri: item.profile_image }}}
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
            // onEndReached={ () => this.props.handleScroll(notifications.length)}
            // onEndReachedThreshold={0}
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
