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
import NotificationsScreen from '../Screens/NotificationsScreen';
import MyProfileScreen from '../Screens/MyProfileScreen';

// Header shows up on Events screen because the events stack is inside the tab navigator

const events = createStackNavigator(
  {
    Map: MapScreen,
    EventDetails: EventDetailsScreen, // TODO: include as component with event icon in props
    Comments: CommentsScreen,
    UserDetails: UserDetailsScreen
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

const details = createStackNavigator(
  {
    Profile: MyProfileScreen,
    EventDetails: EventDetailsScreen, // TODO: include as component with profile icon in props
    UserDetails: UserDetailsScreen,
  }
);

const homeStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: { 
        title: 'Home',
        headerStyle: {
          backgroundColor: PRIMARY_DARK_COLOR
        }
      }
    },
    EventDetails: EventDetailsScreen,
    Comments: CommentsScreen,
    UserDetails: UserDetailsScreen,
  },
  {
    navigationOptions: {
      headerStyle: {
        backgroundColor: PRIMARY_DARK_COLOR
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '200'
      }
    } 
  }
);

const AppStack = createBottomTabNavigator(
  {
    Home: homeStack,
    Events: events,
    Notifications: NotificationsScreen,
    Profile: details,
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
        } else if (routeName === 'Profile') {
          iconName = 'person'
        } else if (routeName === 'Notifications') {
          iconName = 'notifications'
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