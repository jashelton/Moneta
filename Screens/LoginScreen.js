import React from 'react';
import { Button, AsyncStorage } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { APP_ID } from 'react-native-dotenv';

import { authService } from '../Services';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.logOut();
    this.logIn = this.logIn.bind(this);
  }

  async logIn() {
    console.log('LOGIN');
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(APP_ID, {
      permissions: ['public_profile', 'email', 'user_friends'],
    });

    console.log(token)

    if (type === 'success') {
      const data = await authService.fbLogin(token);
      console.log('response from fbLogin()')
      console.log(data);
      console.log('------------')
      const user_data = JSON.stringify(data);
      console.log(user_data);
      console.log('------------')
      await AsyncStorage.setItem('user_data', user_data); // TODO: Really only need fb_id and jwt
      const test = await AsyncStorage.getItem('user_data');
      console.log('GET THE DATA STORED')
      console.log(test);
      console.log('------------')
      this.props.navigation.navigate('App');
    }
  }

  async logOut() {
    return AsyncStorage.removeItem('user_data');
  }

  render() {
    return(
      <View style={styles.container}>
        <Button title="Login with FaceBook" style={styles.button} onPress={this.logIn}></Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
