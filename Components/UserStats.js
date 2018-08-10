import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';

export default class UserStats extends React.Component {
  render() {
    return(
      <ScrollView style={styles.secondaryContainer}>
        <View style={styles.statsWrapper}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statTitle}>Total Events</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  userInfoContainer: {
    height: '50%'
  },
  secondaryContainer: {
    flex: 1,
    padding: 10
  },
  statsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  stat: {
    flexBasis: '49%',
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    minHeight: 150
  },
  statNumber: {
    fontSize: 40,
    color: ACCENT_COLOR
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    color: ACCENT_COLOR
  },
});