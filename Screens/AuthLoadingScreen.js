import React from "react";
import { AsyncStorage, StyleSheet, View, Text } from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { authHelper } from "../Helpers";
import Sentry from "sentry-expo";

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    // AsyncStorage.removeItem("user_data");
    // AsyncStorage.removeItem("user_filters");
    this.getUser();
  }

  async getUser() {
    const user = await authHelper.getParsedUserData();

    if (user && user.jwt) {
      console.log(user.jwt);
      Sentry.setUserContext({
        userId: user.id,
        first_name: user.first_name,
        last_name: user.last_name
      });

      this.props.navigation.navigate("App");
    } else {
      this.props.navigation.navigate("Auth");
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
