import React from "react";
import {
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  View,
  Text
} from "react-native";
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
    console.log(user.jwt);

    if (user && user.jwt) {
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
        <ActivityIndicator />
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
