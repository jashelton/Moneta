import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  FlatList,
  StyleSheet
} from "react-native";
import MomentComponent from "../Components/MomentComponent";
import VibeComponent from "../Components/VibeComponent";
import { WaveIndicator } from "react-native-indicators";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

export default class RecentActivity extends React.Component {
  height = Dimensions.get("window").height / 2;

  _renderEvent({ item }) {
    return item.event_type === "moment" ? (
      <View>
        <MomentComponent
          moment={item}
          navigation={this.props.navigation}
          height={this.height}
        />
      </View>
    ) : (
      <View>
        <VibeComponent
          vibe={item}
          navigation={this.props.navigation}
          height={this.height}
        />
      </View>
    );
  }

  render() {
    const { events, loading, onRefresh } = this.props;

    if (loading)
      return (
        <View style={styles.container}>
          <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
        </View>
      );

    if (!events.length)
      return (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        >
          <Text>There are no events to display.</Text>
        </ScrollView>
      );

    return (
      <View style={{ paddingTop: 5 }}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          numColumns={1}
          data={events}
          renderItem={this._renderEvent.bind(this)}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
