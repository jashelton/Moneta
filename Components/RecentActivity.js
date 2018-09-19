import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList
} from "react-native";
import MomentComponent from "../Components/MomentComponent";
import VibeComponent from "../Components/VibeComponent";
import { adHelper, authHelper } from "../Helpers";

export default class RecentActivity extends React.Component {
  height = Dimensions.get("window").height / 2;

  submitRating = () => {
    // TODO:
    // prevent dupe rating
    // submit the rating
  };

  _renderImage({ item }) {
    return item.event_type === "moment" ? (
      <View>
        <MomentComponent
          moment={item}
          navigation={this.props.navigation}
          height={this.height}
          submitRating={(eventId, value) => this.submitRating(eventId, value)}
        />
      </View>
    ) : (
      <View>
        <VibeComponent
          vibe={item}
          navigation={this.props.navigation}
          height={this.height}
          submitRating={(eventId, value) => this.submitRating(eventId, value)}
        />
      </View>
    );
  }

  render() {
    const { events, noDataMessage, loading } = this.props;

    if (loading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }

    if (events && events.length) {
      return (
        <View style={{ paddingTop: 5 }}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            data={events}
            renderItem={this._renderImage.bind(this)}
            // onEndReached={() => this.props.handleScroll(events.length)}
            // onEndReachedThreshold={0}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={this.props.onRefresh}
              />
            }
          />
        </View>
      );
    } else {
      return (
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center"
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.props._onRefresh}
            />
          }
        >
          <Text>{noDataMessage || "No recent activity to display"}</Text>
        </ScrollView>
      );
    }
  }
}
