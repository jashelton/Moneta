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
import { notificationService } from "../Services";

export default class RecentActivity extends React.Component {
  height = Dimensions.get("window").height / 2;
  state = {
    canRate: true
  };

  // TODO: Need to handle notifications after mutation
  async handleEventLike(event) {
    const currentUserId = await authHelper.getCurrentUserId();

    // If event has been disliked... needs to change for readability.
    if (event.liked) {
      notificationService.deleteNotification(event.id, event.user_id, "like");
    }

    // If event has been liked and the creator isn't the current user, send necessary notifications.
    if (!event.liked && event.user_id !== currentUserId) {
      this.notify(event);
    }
  }

  async notify(event) {
    await notificationService.sendPushNotification(
      event.user_id,
      `Someone liked your ${event.event_type}!`,
      event.title || event.description
    );
    notificationService.createNotification(event.id, event.user_id, "like");
  }

  async submitRating(eventId, value) {
    this.setState({ canRate: false });

    await this.props.updateRating(eventId, value);

    this.setState({ canRate: true });
  }

  _renderImage({ item, index }) {
    return item.event_type === "moment" ? (
      <View>
        <MomentComponent
          moment={item}
          navigation={this.props.navigation}
          height={this.height}
          submitRating={(eventId, value) => this.submitRating(eventId, value)}
          canRate={this.state.canRate}
        />

        {index % 5 === 0 && adHelper.displayPublisherBanner()}
      </View>
    ) : (
      <View>
        <VibeComponent
          vibe={item}
          navigation={this.props.navigation}
          height={this.height}
          submitRating={(eventId, value) => this.submitRating(eventId, value)}
          canRate={this.state.canRate}
        />

        {index % 5 === 0 && adHelper.displayPublisherBanner()}
      </View>
    );
  }

  render() {
    const { events, noDataMessage, refreshing, loading } = this.props;

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
            onEndReached={() => this.props.handleScroll(events.length)}
            onEndReachedThreshold={0}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
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
