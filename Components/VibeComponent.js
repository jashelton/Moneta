import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SocialComponent from "../Components/SocialComponent";
import UserHeaderComponent from "../Components/UserHeaderComponent";
import RatingComponent from "../Components/RatingComponent";

export default class VibeComponent extends React.Component {
  render() {
    const { vibe, navigation } = this.props;

    return (
      <View style={[styles.container]}>
        <UserHeaderComponent
          user={vibe.user}
          createdAt={vibe.created_at}
          navigation={navigation}
        />
        <RatingComponent
          avg_rating={vibe.avg_rating}
          current_rating={vibe.current_user_rating}
          event_id={vibe.id}
        />
        <View style={{ flex: 1, padding: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: "200" }}>
            {vibe.description}
          </Text>
        </View>
        <SocialComponent
          event={vibe}
          navigation={navigation}
          onCommentPress={() =>
            navigation.navigate("EventDetails", {
              eventId: vibe.id,
              userId: vibe.user.id
            })
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 5,
    flex: 1,
    flexDirection: "column"
  },
  ratingsWrapper: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 15
  },
  text: {
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "200"
  }
});
