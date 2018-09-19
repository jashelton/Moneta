import React from "react";
import { Mutation } from "react-apollo";
import { SOCIAL_QUERY } from "../graphql/queries";
import { View, Text, StyleSheet } from "react-native";
import { Icon, Divider } from "react-native-elements";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

export default class SocialComponent extends React.Component {
  LikeComponent = event => {
    return (
      <Mutation mutation={SOCIAL_QUERY}>
        {createLike => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              color="#fb3958"
              name={!event.liked ? "favorite-border" : "favorite"}
              iconStyle={{ padding: 5 }}
              onPress={() => createLike({ variables: { event_id: event.id } })}
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
