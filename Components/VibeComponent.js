import React from 'react';
import { View, Text, Dimensions } from 'react-native';

export default class VibeComponent extends React.Component {
  render() {
    const { vibe } = this.props;
    return(
      <View style={{ flex: 1, height: Dimensions.get('window').height / 4, }}>
        <Text>{vibe.description}</Text>
      </View>
    );
  }
}