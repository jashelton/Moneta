import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AirbnbRating } from "react-native-ratings";
import SocialComponent from "../Components/SocialComponent";
import UserHeaderComponent from "../Components/UserHeaderComponent";

export default class VibeComponent extends React.Component {
  submitRating(value) {
    const { vibe, canRate } = this.props;

    if (vibe.user_rating !== value && canRate) {
      const rating = {
        previousRating: vibe.user_rating || null,
        newRating: value
      };

      this.props.submitRating(vibe.id, rating);
    }
  }

  render() {
    const { vibe, navigation } = this.props;

    return (
      <View style={[styles.container]}>
        <UserHeaderComponent user={vibe.user} createdAt={vibe.created_at} />
        <View
          style={{
            alignItems: "flex-end",
            justifyContent: "center",
            marginRight: 15
          }}
        >
          <View>
            <Text
              style={{ alignSelf: "center", fontSize: 14, fontWeight: "200" }}
            >
              {vibe.avg_rating ? `Avg: ${vibe.avg_rating}` : "No ratings yet."}
            </Text>
            <AirbnbRating
              count={5}
              defaultRating={vibe.current_user_rating || 0}
              size={22}
              showRating={false}
              onFinishRating={value => this.submitRating(value)}
            />
            <Text
              style={{ alignSelf: "center", fontSize: 14, fontWeight: "200" }}
            >
              {vibe.current_user_rating
                ? `My Rating: ${vibe.current_user_rating}`
                : "Rate Anonymously"}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: 15 }}>
          <Text style={{ fontSize: 14, fontWeight: "200" }}>
            {vibe.description}
          </Text>
        </View>
        <SocialComponent
          event={vibe}
          navigation={navigation}
          onCommentPress={() =>
            navigation.navigate("EventDetails", { eventId: vibe.id })
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
  }
});
