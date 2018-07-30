import React, { Component } from 'react';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';

import HomeScreen from '../Screens/HomeScreen';
import MapScreen from '../Screens/MapScreen';
import EventDetailsScreen from '../Screens/EventDetailsScreen';

import AuthLoadingScreen from '../Screens/AuthLoadingScreen';
import LoginScreen from '../Screens/LoginScreen';
import CommentsScreen from '../Screens/CommentsScreen';
import UserDetailsScreen from '../Screens/UserDetailsScreen';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';

const AppStack = createStackNavigator(
  // ROUTES:
  {
    Home: HomeScreen,
    Map: MapScreen,
    EventDetails: EventDetailsScreen,
    Comments: CommentsScreen,
    UserProfile: UserDetailsScreen
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: PRIMARY_DARK_COLOR,
      },
      headerTintColor: ACCENT_COLOR,
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }
)

const AuthStack = createStackNavigator({ Login: LoginScreen });

export const Navigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
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