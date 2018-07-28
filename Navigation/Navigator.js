import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';

import HomeScreen from '../Screens/HomeScreen';
import MapScreen from '../Screens/MapScreen';
import EventDetailsScreen from '../Screens/EventDetailsScreen';

const AppStack = createStackNavigator(
  // ROUTES:
  {
    Home: HomeScreen,
    Map: MapScreen,
    EventDetails: EventDetailsScreen
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#1C7ED7',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }
)

// const AuthStack = createStackNavigator({ Login: LoginScreen });

export const Navigator = createSwitchNavigator(
  {
    // AuthLoading: AuthLoadingScreen,
    App: AppStack,
    // Auth: AuthStack,
  },
  {
    initialRouteName: 'App',
  }
);

class Nav extends Component {
  render() {
    return(
      <Navigator />
    );
  }
}

export default Nav