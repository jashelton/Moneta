import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableHighlight
} from "react-native";
import RatingComponent from "../Components/RatingComponent";
import SocialComponent from "../Components/SocialComponent";

const EventInfoComponent = ({ event, navigation, inputFocus, onImgPress }) => {
  return (
    <View style={styles.container}>
      <RatingComponent
        avg_rating={event.avg_rating}
        current_rating={event.current_user_rating}
        event_id={event.id}
      />
      <View style={[styles.textContent, { padding: 10 }]}>
        {event.title && (
          <Text style={{ fontSize: 18, fontWeight: "500" }}>{event.title}</Text>
        )}
        {event.distanceFrom &&
          event.distanceFrom.status === "OK" && (
            <Text style={styles.subText}>
              {event.distanceFrom.distance.text}
            </Text>
          )}
        <Text style={{ fontSize: 14, fontWeight: "200", marginTop: 15 }}>
          {event.description}
        </Text>
      </View>
      {event.image && (
        <TouchableHighlight onPress={() => onImgPress()}>
          <Image style={styles.image} source={{ uri: event.image }} />
        </TouchableHighlight>
      )}
      <SocialComponent
        event={event}
        navigation={navigation}
        onLikePress={() => this.favoriteEvent()}
        onCommentPress={() => inputFocus()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff"
  },
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.35
  }
});

export default EventInfoComponent;
