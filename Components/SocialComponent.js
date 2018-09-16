import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { View, Text, StyleSheet } from "react-native";
import { Icon, Divider } from "react-native-elements";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

const SOCIAL_QUERY = gql`
  mutation SocialMutation($event_id: ID!) {
    createLike(event_id: $event_id) {
      id
      likes_count
    }
  }
`;

export default class SocialComponent extends React.Component {
  render() {
    const { event, onCommentPress, onLikePress, navigation } = this.props;

    return (
      <Mutation mutation={SOCIAL_QUERY}>
        {(createLike, { data }) => (
          <View style={styles.container}>
            <Divider />
            <View
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  color="#fb3958"
                  name={!event.liked ? "favorite-border" : "favorite"}
                  iconStyle={{ padding: 5 }}
                  // onPress={() => onLikePress()}
                  onPress={() =>
                    createLike({ variables: { event_id: event.id } })
                  }
                />
                {event.likes_count && (
                  <Text
                    onPress={() =>
                      navigation.navigate("Likes", { eventId: event.id })
                    }
                    style={{ paddingHorizontal: 5, color: PRIMARY_DARK_COLOR }}
                  >
                    {event.likes_count}{" "}
                    {event.likes_count === 1 ? "like" : "likes"}
                  </Text>
                )}
              </View>
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
        )}
      </Mutation>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  }
});
