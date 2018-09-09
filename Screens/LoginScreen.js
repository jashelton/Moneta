import React from "react";
import { Button, AsyncStorage } from "react-native";
import { StyleSheet, View } from "react-native";
import { APP_ID } from "react-native-dotenv";

import { authService } from "../Services";

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
        permissions: ["public_profile", "email", "user_friends"]
      }
    );

    if (type === "success") {
      const data = await authService.fbLogin(token);
      const user_data = JSON.stringify(data);

      await AsyncStorage.setItem("user_data", user_data); // TODO: Really only need fb_id and jwt
      this.props.navigation.navigate("App");
    }
  }

  async logOut() {
    return AsyncStorage.removeItem("user_data");
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Login with FaceBook"
          style={styles.button}
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
    alignItems: "center",
    justifyContent: "center"
  }
});
