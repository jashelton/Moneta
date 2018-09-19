import React from "react";
import PropTypes from "prop-types";
import { StyleSheet } from "react-native";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { ListItem, Avatar } from "react-native-elements";
import TimeAgo from "react-native-timeago";

const UserHeaderComponent = props => {
  const { user, createdAt, navigation } = props;

  return (
    <ListItem
      leftAvatar={
        <Avatar
          size="small"
          rounded
          source={user.profile_image ? { uri: user.profile_image } : null}
          icon={{ name: "person", size: 20 }}
          activeOpacity={0.7}
        />
      }
      title={`${user.first_name} ${user.last_name}`}
      titleStyle={{ color: PRIMARY_DARK_COLOR }}
      subtitle={<TimeAgo time={createdAt} style={styles.subText} />}
      chevron
      onPress={() => navigation.navigate("UserDetails", { userId: user.id })}
    />
  );
};

UserHeaderComponent.propTypes = {
  user: PropTypes.object.isRequired,
  createdAt: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  }
});

export default UserHeaderComponent;
