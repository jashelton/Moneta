import React from "react";
import { Constants } from "expo";
import { View, Modal, StyleSheet, Text } from "react-native";
import { Button, ListItem, Slider } from "react-native-elements";
import ViewToggle from "../Components/ViewToggle";

import {
  PRIMARY_DARK_COLOR,
  TEXT_ICONS_COLOR
} from "../common/styles/common-styles";

export default class FiltersModal extends React.Component {
  state = {
    rankingVisible: false,
    rankingValue: null // handle from AsyncStorage state
  };

  _submitFilters = () => {
    const { rankingValue } = this.state;
    const selected = {
      rank: rankingValue
    };

    this.props.toggleVisibility();
    this.props.onSetFilters(selected);
  };

  render() {
    const { rankingVisible, rankingValue } = this.state;
    const { isVisible, toggleVisibility, rateLimit } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={toggleVisibility}
      >
        <View style={styles.modalHeader}>
          <Button
            clear
            title="Cancel"
            titleStyle={{ color: TEXT_ICONS_COLOR }}
            buttonStyle={{ marginLeft: 15 }}
            onPress={toggleVisibility}
          />
          <Button
            clear
            title="Done"
            titleStyle={{ color: TEXT_ICONS_COLOR }}
            buttonStyle={{ marginRight: 15 }}
            onPress={this._submitFilters}
          />
        </View>
        <View style={{ flexDirection: "column", padding: 15 }}>
          <ListItem
            title={`Minimum Rating: ${
              rankingValue !== null ? rankingValue : rateLimit
            }`}
            leftIcon={{ name: "star" }}
            bottomDivider
            chevron
            onPress={() => this.setState({ rankingVisible: !rankingVisible })}
          />
          <ViewToggle hide={!rankingVisible}>
            <View style={styles.innerAccordion}>
              <Slider
                value={rankingValue !== null ? rankingValue : rateLimit}
                onValueChange={rankingValue => this.setState({ rankingValue })}
                minimumValue={0}
                maximumValue={5}
                step={0.25}
                thumbTintColor={PRIMARY_DARK_COLOR}
              />
            </View>
          </ViewToggle>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Constants.statusBarHeight
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff"
  },
  innerAccordion: {
    marginBottom: 25,
    alignItems: "stretch",
    justifyContent: "center"
  }
});
