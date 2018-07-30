import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { Constants } from 'expo';

export default class UserDetailsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  render() {
    return(
      <View style={styles.container}>
        {/* <View style={styles.userInfoContainer}>
          <Card>
            <Text>User Info Section</Text>
            <Text>Remove header... well designed header background with a custom tab navigation at the bottom.</Text>
            <Text>Tab Navigation -> Events, Stats, Connect(? -> Comments?)</Text>
          </Card>
        </View>
        <View style={styles.lastestEventContainer}>
          <Card>
            <Text>Last User Event Section</Text>
          </Card>
        </View>
        <View style={styles.userStatsContainer}>
          <Card>
            <Text>User Stats Section</Text>
          </Card>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  userInfoContainer: {
    height: '30%',
  },
  lastestEventContainer: {
    height: '20%',
  },
  userStatsContainer: {
    flex: 1,
  }
});
