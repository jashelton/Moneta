import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableHighlight
} from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import RatingComponent from "../Components/RatingComponent";
import SocialComponent from "../Components/SocialComponent";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

export default class EventInfoComponent extends React.Component {
  _renderImages = ({ item }) => {
    return (
      <TouchableHighlight onPress={() => this.props.onImgPress(item.image)}>
        <Image style={styles.image} source={{ uri: item.image }} />
      </TouchableHighlight>
    );
  };

  render() {
    const {
      event,
      navigation,
      inputFocus,
      activeImage,
      setActiveImage
    } = this.props;
    const { width } = Dimensions.get("window");

    return (
      <View style={styles.container}>
        <RatingComponent
          avg_rating={event.avg_rating}
          current_rating={event.current_user_rating}
          event_id={event.id}
        />
        <View style={[styles.textContent, { padding: 10 }]}>
          {event.title && (
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {event.title}
            </Text>
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
        {event.Images &&
          event.Images.length && (
            <View>
              <Carousel
                ref={c => {
                  this._carousel = c;
                }}
                data={event.Images}
                renderItem={this._renderImages}
                sliderWidth={width}
                itemWidth={width}
                onSnapToItem={index => setActiveImage(index)}
                layout={"default"}
              />
              <Pagination
                dotsLength={event.Images.length}
                activeDotIndex={activeImage}
                containerStyle={{ paddingVertical: 5 }}
                dotColor={PRIMARY_DARK_COLOR}
                inactiveDotColor="#1a1917"
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
                carouselRef={this._slider1Ref}
                tappableDots={!!this._slider1Ref}
              />
            </View>
          )}
        <SocialComponent
          event={event}
          navigation={navigation}
          onLikePress={() => this.favoriteEvent()}
          onCommentPress={() => inputFocus()}
        />
      </View>
    );
  }
}

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
