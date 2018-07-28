import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  AsyncStorage
} from 'react-native';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    AsyncStorage.getItem('user_data')
                .then(res => {
                  const user = JSON.parse(res);
                  this.props.navigation.navigate(user.jwt ? 'App' : 'Auth');
                })
                .catch(err => console.log(err));
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
