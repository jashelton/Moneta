import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Home',
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="pin-drop"
          color="#fff"
          onPress={navigation.getParam('navigateToMap')}
        />
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMap: () => this.navigateTo('Map')
    });
  }

  navigateTo(location) {
    this.props.navigation.navigate(location);
  }

  render() {
    return(
      <View style={styles.container}>
        <Text>Home Screen</Text>
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
  rightIcon: {
    marginRight: 10
  },
});