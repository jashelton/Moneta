import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { ListItem, Avatar, Rating } from "react-native-elements";
import { AirbnbRating } from "react-native-ratings";
import SocialComponent from "../Components/SocialComponent";
import TimeAgo from "react-native-timeago";

export default class VibeComponent extends React.Component {
  submitRating(value) {
    const { vibe, canRate } = this.props;

    if (vibe.rating.user_rating !== value && canRate) {
      const rating = {
        previousRating: vibe.rating.user_rating || null,
        newRating: value
      };

      this.props.submitRating(vibe.id, rating);
    }
  }

  render() {
    const { vibe, navigation, handleLike } = this.props;

    return (
      <View style={[styles.container]}>
        <ListItem
          leftAvatar={
            <Avatar
              size="small"
              rounded
              source={vibe.profile_image ? { uri: vibe.profile_image } : null}
              icon={{ name: "person", size: 20 }}
              activeOpacity={0.7}
            />
          }
          title={vibe.name}
          titleStyle={{ color: PRIMARY_DARK_COLOR }}
          subtitle={<TimeAgo time={vibe.created_at} style={styles.subText} />}
          chevron
          onPress={() =>
            navigation.navigate("UserDetails", { userId: vibe.user_id })
          }
        />
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
              {vibe.rating.avg_rating
                ? `Avg: ${vibe.rating.avg_rating}`
                : "No ratings yet."}
            </Text>
            <AirbnbRating
              count={5}
              defaultRating={vibe.rating.user_rating || 0}
              size={22}
              showRating={false}
              onFinishRating={value => this.submitRating(value)}
            />
            <Text
              style={{ alignSelf: "center", fontSize: 14, fontWeight: "200" }}
            >
              {vibe.rating.user_rating
                ? `My Rating: ${vibe.rating.user_rating}`
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
          showCommentIcon={true}
          onLikePress={() => handleLike()}
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
  },
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  }
});
