import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';

export default class NotificationsScreen extends React.Component {
  render() {
    return(
      <View style={styles.constainer}>
        <Text>Notifications Screen</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_LIGHT_COLOR
  }
});
