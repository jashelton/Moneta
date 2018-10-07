import React from "react";
import { View, StyleSheet } from "react-native";
import { ListItem } from "react-native-elements";
import { DIVIDER_COLOR } from "../common/styles/common-styles";
import { adHelper } from "../Helpers";

export default class CreateEventScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ListItem
          title="Create Moment"
          subtitle="Upload an image with location."
          subtitleStyle={styles.subtitleText}
          chevron
          onPress={() => this.props.navigation.navigate("CreateMoment")}
          bottomDivider
        />
        <ListItem
          title="Create Vibe"
          subtitle="Spread a positive vibe and let your friends know what you're up to"
          subtitleStyle={styles.subtitleText}
          chevron
          onPress={() => this.props.navigation.navigate("CreateVibe")}
          bottomDivider
        />
        <View style={{ position: "absolute", bottom: 0 }}>
          {adHelper.displayPublisherBanner()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subtitleText: {
    fontSize: 12,
    color: DIVIDER_COLOR
  }
});
