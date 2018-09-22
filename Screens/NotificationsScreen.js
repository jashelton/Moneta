import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { ListItem, Avatar, Icon } from "react-native-elements";
import TimeAgo from "react-native-timeago";
import { Query } from "react-apollo";
import ErrorComponent from "../Components/ErrorComponent";
import { NOTIFICATIONS } from "../graphql/queries";

export default class NotificationsScreen extends React.Component {
  static navigationOptions = { title: "Notifications" };

  _renderNotification({ item }) {
    const { action_type, event } = item;
    const { user } = item.event;
    return (
      <ListItem
        title={`${user.first_name} ${user.last_name} ${
          action_type === "like" ? "liked" : "commented on"
        } your event.`}
        titleStyle={{ fontSize: 12 }}
        subtitle={<TimeAgo time={item.created_at} style={styles.subText} />}
        chevron
        leftAvatar={
          <Avatar
            size="small"
            source={user.image ? { uri: user.image } : null}
            icon={{ name: "person", size: 20 }}
            activeOpacity={0.7}
          />
        }
        rightAvatar={
          <Avatar
            size="small"
            rounded
            source={
              event.Images && event.images.length
                ? { uri: event.Images[0].image }
                : null
            }
            icon={{ name: "chat-bubble-outline", size: 20 }}
            activeOpacity={0.7}
          />
        }
        onPress={() =>
          this.props.navigation.navigate("EventDetails", {
            eventId: event.id,
            userId: user.id
          })
        }
      />
    );
  }

  render() {
    return (
      <View style={styles.constainer}>
        <Query query={NOTIFICATIONS} variables={{ offset: 0 }}>
          {({ loading, error, refetch, fetchMore, data }) => {
            if (loading)
              return (
                <View>
                  <ActivityIndicator />
                </View>
              );

            if (error)
              return (
                <ErrorComponent
                  iconName="error"
                  refetchData={refetch}
                  errorMessage={error.message}
                  isSnackBarVisible={error ? true : false}
                  snackBarActionText="Retry"
                />
              );
            return (
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data.userNotifications}
                renderItem={this._renderNotification.bind(this)}
                onEndReached={() =>
                  fetchMore({
                    variables: { offset: data.userNotifications.length },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return Object.assign({}, prev, {
                        userNotifications: [
                          ...prev.userNotifications,
                          ...fetchMoreResult.userNotifications
                        ]
                      });
                    }
                  })
                }
                onEndReachedThreshold={0}
                refreshControl={
                  <RefreshControl refreshing={loading} onRefresh={refetch} />
                }
              />
            );
          }}
        </Query>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1
  }
});
