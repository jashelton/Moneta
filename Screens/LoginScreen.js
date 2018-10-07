import React from "react";
import { AsyncStorage, StyleSheet, View } from "react-native";
import { SocialIcon } from "react-native-elements";
import { APP_ID } from "react-native-dotenv";
import { authService } from "../Services";
import { filters } from "../common/defaults/filters";
import { commonHelper } from "../Helpers";

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.logOut();
    this.logIn = this.logIn.bind(this);
  }

  async logIn() {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(
      APP_ID,
      {
        permissions: ["public_profile", "email"]
      }
    );

    if (type === "success") {
      const data = await authService.fbLogin(token);
      const user_data = JSON.stringify(data);

      await AsyncStorage.setItem("user_data", user_data);

      // Check if user_filters exists and is current, if not, set default filters.
      // TODO: Need better handling of filters... don't blow away prev filters values.
      const user_filters = await commonHelper.getFilters();

      if (
        !user_filters ||
        user_filters.schemaVersion !== filters.schemaVersion
      ) {
        await AsyncStorage.removeItem("user_filters");
        await AsyncStorage.setItem("user_filters", JSON.stringify(filters));
      }

      this.props.navigation.navigate("App");
    }
  }

  async logOut() {
    return AsyncStorage.removeItem("user_data");
  }

  render() {
    return (
      <View style={styles.container}>
        <SocialIcon
          title="Sign In With Facebook"
          button
          type="facebook"
          onPress={this.logIn}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  }
});
