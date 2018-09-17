import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image
} from "react-native";
import { AirbnbRating } from "react-native-ratings";
import SocialComponent from "./SocialComponent";
import UserHeaderComponent from "../Components/UserHeaderComponent";

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
      <View style={styles.container}>
        <UserHeaderComponent user={moment.user} createdAt={moment.created_at} />
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
              defaultRating={moment.current_user_rating || 0}
              size={22}
              showRating={false}
              onFinishRating={value => this.submitRating(value)}
            />
            <Text
              style={{ alignSelf: "center", fontSize: 14, fontWeight: "200" }}
            >
              {moment.current_user_rating
                ? `My Rating: ${moment.current_user_rating}`
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
          onCommentPress={() =>
            navigation.navigate("EventDetails", { eventId: moment.id })
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    margin: 5,
    backgroundColor: "#fff"
  },
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
  }
});
