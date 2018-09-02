import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class VibeComponent extends React.Component {
  render() {
    const { vibe, height, navigation } = this.props;
    return(
      <View style={ [styles.container, { height }] }>
        <View style={{ alignItems: 'flex-end', justifyContent: 'center', padding: 10 }}>
          <Text>Rank Vibe (coming soon)</Text>
        </View>
        <View style={{ alignItems: 'flex-start' }}>
          <Text>
            <Text
              style={{ color: 'blue' }}
              onPress={() => navigation.navigate('UserDetails', { userId: vibe.user_id })}>
              {vibe.name}
            </Text>
            <Text> has created a new vibe.</Text>
          </Text>
        </View>
        <View style={{ flex: 1, padding: 15 }}>
          <Text>{vibe.description}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 5,
    flex: 1,
    flexDirection: 'column',
    padding: 5
  },
});
