import React from "react";
import { View, StyleSheet, FlatList, RefreshControl, Text } from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { ListItem, Avatar, Icon } from "react-native-elements";
import TimeAgo from "react-native-timeago";
import { Query } from "react-apollo";
import ErrorComponent from "../Components/ErrorComponent";
import { NOTIFICATIONS } from "../graphql/queries";
import { adHelper } from "../Helpers";

export default class NotificationsScreen extends React.Component {
  static navigationOptions = { title: "Notifications" };

  _renderNotification({ item }) {
    const { action_type, event, actor } = item;
    const { user } = item.event;
    const iconType = {
      like: "favorite",
      comment: "chat-bubble-outline"
    };

    return (
      <ListItem
        title={`${actor.first_name} ${actor.last_name} ${
          action_type === "like" ? "liked" : "commented on"
        } your event.`}
        titleStyle={{ fontSize: 14 }}
        subtitle={<TimeAgo time={item.created_at} style={styles.subText} />}
        chevron
        leftAvatar={
          <Avatar
            size="small"
            source={actor.profile_image ? { uri: actor.profile_image } : null}
            icon={{ name: "person", size: 20 }}
            activeOpacity={0.7}
          />
        }
        rightAvatar={
          <Avatar
            size="small"
            rounded
            source={
              event.Images && event.Images.length
                ? { uri: event.Images[0].image }
                : null
            }
            icon={{ name: iconType[action_type], size: 20 }}
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
      <View style={styles.container}>
        <Query query={NOTIFICATIONS} variables={{ offset: 0 }}>
          {({ loading, error, refetch, fetchMore, data }) => {
            if (loading)
              return (
                <View>
                  <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
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

            if (!data.userNotifications.length)
              return (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text>No notifications to display.</Text>
                </View>
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
        <View style={{ position: "absolute", bottom: 0 }}>
          {adHelper.displayPublisherBanner()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  }
});
