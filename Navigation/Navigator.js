import React, { Component } from 'react';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator } from 'react-navigation';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { Icon } from 'react-native-elements';

import HomeScreen from '../Screens/HomeScreen';
import MapScreen from '../Screens/MapScreen';
import EventDetailsScreen from '../Screens/EventDetailsScreen';
import AuthLoadingScreen from '../Screens/AuthLoadingScreen';
import LoginScreen from '../Screens/LoginScreen';
import CommentsScreen from '../Screens/CommentsScreen';
import UserDetailsScreen from '../Screens/UserDetailsScreen';

const events = createStackNavigator(
  {
    Map: MapScreen,
    EventDetails: EventDetailsScreen,
    Comments: CommentsScreen
  },
  {
    navigationOptions: {
      headerStyle: {
        // backgroundColor: PRIMARY_LIGHT_COLOR
      },
      headerTintColor: PRIMARY_DARK_COLOR,
      headerTitleStyle: {
        fontWeight: '200'
      }
    }
  }
);

const AppStack = createBottomTabNavigator(
  {
    Home: HomeScreen,
    Events: events,
    UserProfile: UserDetailsScreen,
  },
  {
    initialRouteName: 'Home',
    navigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const {routeName} = navigation.state;
        let iconName;
        if (routeName === 'Home') {
          iconName = 'home'
        } else if (routeName === 'Events') {
          iconName = 'pin-drop'
        } else if (routeName === 'UserProfile') {
          iconName = 'person'
        }

        return <Icon name={iconName} size={25} color={tintColor} />
      }
    }),
    tabBarOptions: {
      activeTintColor: PRIMARY_DARK_COLOR,
      inactiveTintColor: PRIMARY_LIGHT_COLOR,
      // tabStyle: { backgroundColor: }
    }
  }
);

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