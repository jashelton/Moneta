import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  AsyncStorage
} from 'react-native';
import { authHelper, commonHelper } from '../Helpers';
import { defaultFilters } from '../common/defaults/defaultEventFilters';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    AsyncStorage.removeItem('user_filters');
    this.getUser();
    // AsyncStorage.getItem('user_data')
    //             .then(res => {
    //               const user = JSON.parse(res);
    //               this.props.navigation.navigate(user.jwt ? 'App' : 'Auth');
    //             })
    //             .catch(err => console.log(err));
  }

  async getUser() {
    const user = await authHelper.getParsedUserData();
    if (user.jwt) {
      const filters = await commonHelper.getFilters();
      if (!filters) {
        const newFilters = JSON.stringify(defaultFilters);
        AsyncStorage.setItem('user_filters', newFilters);
      }

      this.props.navigation.navigate('App');
    } else {
      this.props.navigation.navigate('Auth');
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
