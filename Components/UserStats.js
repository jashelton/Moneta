import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { ACCENT_COLOR, PRIMARY_DARK_COLOR, DIVIDER_COLOR } from '../common/styles/common-styles';

export default class UserStats extends React.Component {
  render() {
    const { stats } = this.props;

    return(
      <ScrollView style={styles.container}>
        <View style={styles.statsWrapper}>
          { Object.keys(stats).map((key, i) => (
            <View key={i} style={{padding: 2, flexBasis: '33.33%'}}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{stats[key] || '-'}</Text>
                <Text style={styles.statTitle}>{key.split('_').join(' ').toUpperCase()}</Text>
              </View>
            </View>  
          ))}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: PRIMARY_DARK_COLOR
  },
  statsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  statNumber: {
    fontSize: 40,
    color: DIVIDER_COLOR
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '200',
    marginBottom: 8,
    textAlign: 'center',
    color: ACCENT_COLOR
  },
});