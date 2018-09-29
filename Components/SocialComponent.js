import React from "react";
import { Mutation } from "react-apollo";
import { TOGGLE_LIKE } from "../graphql/queries";
import { View, Text, StyleSheet } from "react-native";
import { Icon, Divider } from "react-native-elements";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { notificationService } from '../Services';
import { authHelper } from '../Helpers/';

export default class SocialComponent extends React.Component {
  LikeComponent = event => {
    return (
      <Mutation mutation={TOGGLE_LIKE}>
        {toggleLike => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              color="#fb3958"
              name={!event.has_liked ? "favorite-border" : "favorite"}
              iconStyle={{ padding: 5 }}
              onPress={() => {
                  toggleLike({
                    variables: { event_id: event.id }
                  }).then( async ({ data: { toggleLike } }) => {
                    const currentUserId = await authHelper.getCurrentUserId();
                    const { has_liked, user } = toggleLike;

                    if (has_liked && user.push_token && currentUserId !== user.id) {
                      const body = `Someone has liked your ${toggleLike.event_type}.`;
                      notificationService.sendPushNotification(user.push_token, 'Title', body);
                    }
                  });
                }
              }
            />
            {event.likes_count && (
              <Text
                onPress={() =>
                  this.props.navigation.navigate("Likes", { eventId: event.id })
                }
                style={{ paddingHorizontal: 5, color: PRIMARY_DARK_COLOR }}
              >
                {event.likes_count} {event.likes_count === 1 ? "like" : "likes"}
              </Text>
            )}
          </View>
        )}
      </Mutation>
    );
  };

  render() {
    const { event, onCommentPress } = this.props;

    return (
      <View style={styles.container}>
        <Divider />
        <View style={styles.socialWrapper}>
          {this.LikeComponent(event)}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text>{event.comments_count}</Text>
            <Icon
              color="#fb3958"
              name="comment"
              iconStyle={{ padding: 5 }}
              onPress={() => onCommentPress()}
            />
          </View>
        </View>
        <Divider />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  },
  socialWrapper: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
