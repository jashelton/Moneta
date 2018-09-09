import React from "react";
import { Constants } from "expo";
import { View, Text, Modal, StyleSheet, FlatList } from "react-native";
import { Button, ListItem, Avatar } from "react-native-elements";

import {
  PRIMARY_DARK_COLOR,
  TEXT_ICONS_COLOR
} from "../common/styles/common-styles";

export default class FollowsModal extends React.Component {
  _navigateToUserDetails(userId) {
    const { navigation, toggleFollowsModal, navigateToUser } = this.props;
    toggleFollowsModal();
    // TODO: This causes an issue with routing.
    navigation.replace("UserDetails", { userId });
  }

  _renderFollow({ item }) {
    return (
      <ListItem
        title={item.username || item.name}
        titleStyle={{ fontSize: 12 }}
        leftAvatar={
          <Avatar
            size="small"
            rounded
            source={item.profile_image ? { uri: item.profile_image } : null}
            icon={{ name: "person", size: 20 }}
            activeOpacity={0.7}
          />
        }
        onPress={() => this.props.navigateToUser(item.user_id)}
        chevron
        bottomDivider
      />
    );
  }

  render() {
    const { isVisible, toggleFollowsModal, followsList } = this.props;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={() => toggleFollowsModal()}
      >
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }} />
          <Button
            clear
            title="Close"
            titleStyle={{ color: TEXT_ICONS_COLOR }}
            buttonStyle={{ marginRight: 15 }}
            onPress={() => toggleFollowsModal()}
          />
        </View>
        <View>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={followsList}
            renderItem={this._renderFollow.bind(this)}
            // onEndReached={ () => this.handleScroll(notifications.length)}
            // onEndReachedThreshold={0}
            // refreshControl={
            //   <RefreshControl
            //     refreshing={refreshing}
            //     onRefresh={this.getNotifications}
            //   />
            // }
          />
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
  }
});
