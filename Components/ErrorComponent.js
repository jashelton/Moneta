import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import SnackBar from "react-native-snackbar-component";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

const ErrorComponent = props => {
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Icon
          size={36}
          name={props.iconName}
          color={PRIMARY_DARK_COLOR}
          onPress={() => props.refetchData()}
        />
      </View>
      <SnackBar
        visible={props.isSnackBarVisible}
        textMessage={props.errorMessage}
        actionHandler={() => props.refetchData()}
        actionText={props.snackBarActionText}
      />
    </View>
  );
};

ErrorComponent.propTypes = {
  iconName: PropTypes.string.isRequired,
  refetchData: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
  isSnackBarVisible: PropTypes.bool.isRequired,
  snackBarActionText: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default ErrorComponent;
