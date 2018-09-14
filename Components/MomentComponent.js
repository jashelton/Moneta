import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image
} from "react-native";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { ListItem, Avatar } from "react-native-elements";
import { AirbnbRating } from "react-native-ratings";
import SocialComponent from "./SocialComponent";
import TimeAgo from "react-native-timeago";

export default class MomentComponent extends React.Component {
  submitRating(value) {
    const { moment, canRate } = this.props;

    if (moment.user_rating !== value && canRate) {
      const rating = {
        previousRating: moment.user_rating || null,
        newRating: value
      };

      this.props.submitRating(moment.id, rating);
    }
  }

  render() {
    const { moment, navigation, height, handleLike } = this.props;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          margin: 5,
          backgroundColor: "#fff"
        }}
      >
        <ListItem
          leftAvatar={
            <Avatar
              size="small"
              rounded
              source={
                moment.user.profile_image
                  ? { uri: moment.user.profile_image }
                  : null
              }
              icon={{ name: "person", size: 20 }}
              activeOpacity={0.7}
            />
          }
          title={`${moment.user.first_name} ${moment.user.last_name}`}
          titleStyle={{ color: PRIMARY_DARK_COLOR }}
          subtitle={<TimeAgo time={moment.created_at} style={styles.subText} />}
          chevron
          onPress={() =>
            navigation.navigate("UserDetails", { userId: moment.user_id })
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
              {moment.avg_rating
                ? `Avg: ${moment.avg_rating}`
                : "No ratings yet."}
            </Text>
            <AirbnbRating
              count={5}
              defaultRating={moment.user_rating || 0}
              size={22}
              showRating={false}
              onFinishRating={value => this.submitRating(value)}
            />
            <Text
              style={{ alignSelf: "center", fontSize: 14, fontWeight: "200" }}
            >
              {moment.user_rating
                ? `My Rating: ${moment.user_rating}`
                : "Rate Anonymously"}
            </Text>
          </View>
        </View>

        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "400", marginBottom: 5 }}>
            {moment.title}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "200" }}>
            {moment.description}
          </Text>
        </View>

        <TouchableHighlight
          underlayColor="#eee"
          style={[styles.imageTouch, { height }]}
          onPress={() =>
            navigation.push("EventDetails", { eventId: moment.id })
          }
        >
          <Image
            style={styles.image}
            resizeMode="cover"
            source={{ uri: moment.image }}
          />
        </TouchableHighlight>
        <SocialComponent
          event={moment}
          navigation={navigation}
          showCommentIcon={true}
          onLikePress={() => handleLike()}
          onCommentPress={() =>
            navigation.navigate("EventDetails", { eventId: moment.id })
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageTouch: {
    width: "100%",
    padding: 2
  },
  image: {
    flex: 1
  },
  imageOverlay: {
    width: "100%",
    padding: 5,
    justifyContent: "center"
  },
  imageTopOverlay: {
    width: "100%",
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  }
});
