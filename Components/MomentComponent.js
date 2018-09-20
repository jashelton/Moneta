import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image
} from "react-native";
import SocialComponent from "./SocialComponent";
import UserHeaderComponent from "../Components/UserHeaderComponent";
import RatingComponent from "../Components/RatingComponent";

export default class MomentComponent extends React.Component {
  render() {
    const { moment, navigation, height } = this.props;

    return (
      <View style={styles.container}>
        <UserHeaderComponent
          user={moment.user}
          createdAt={moment.created_at}
          navigation={navigation}
        />
        <RatingComponent
          avg_rating={moment.avg_rating}
          current_rating={moment.current_user_rating}
          event_id={moment.id}
        />
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
            navigation.push("EventDetails", {
              eventId: moment.id,
              userId: moment.user.id
            })
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
            navigation.navigate("EventDetails", {
              eventId: moment.id,
              userId: moment.user.id
            })
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
