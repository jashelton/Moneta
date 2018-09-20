import React from "react";
import { View, RefreshControl, Dimensions, FlatList } from "react-native";
import MomentComponent from "../Components/MomentComponent";
import VibeComponent from "../Components/VibeComponent";

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
    return (
      <View style={{ paddingTop: 5 }}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          numColumns={1}
          data={this.props.events}
          renderItem={this._renderEvent.bind(this)}
          refreshControl={
            <RefreshControl
              refreshing={this.props.loading}
              onRefresh={this.props.onRefresh}
            />
          }
        />
      </View>
    );
  }
}
