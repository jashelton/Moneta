import React, { Component } from 'react';
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator, NavigationActions } from 'react-navigation';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR, TEXT_ICONS_COLOR } from '../common/styles/common-styles';
import { Icon } from 'react-native-elements';

import HomeScreen from '../Screens/HomeScreen';
import MapScreen from '../Screens/MapScreen';
import EventDetailsScreen from '../Screens/EventDetailsScreen';
import AuthLoadingScreen from '../Screens/AuthLoadingScreen';
import LoginScreen from '../Screens/LoginScreen';
import UserDetailsScreen from '../Screens/UserDetailsScreen';
import NotificationsScreen from '../Screens/NotificationsScreen';
import MyProfileScreen from '../Screens/MyProfileScreen';
import CreateEventScreen from '../Screens/CreateEventScreen';
import CreateVibeScreen from '../Screens/CreateVibeScreen';
import CreateMomentScreen from '../Screens/CreateMomentScreen';

// Header shows up on Events screen because the events stack is inside the tab navigator

// TODO:
// Create proper stacks
// New CreateEventScreen

const recentActivityStack = createStackNavigator(
  {
    Recent: HomeScreen,
    EventDetails: EventDetailsScreen,
    UserDetails: UserDetailsScreen,
  },
  {
    navigationOptions: {
      headerTitleStyle: {
        fontWeight: '200',
        fontSize: 16
      }
    } 
  }
);
const eventsStack = createStackNavigator(
  {
    Map: MapScreen,
    EventDetails: EventDetailsScreen, // TODO: include as component with event icon in props
    UserDetails: UserDetailsScreen
  },
  {
    navigationOptions: {
      headerTitleStyle: {
        fontWeight: '200'
      }
    }
  }
);
const newEventStack = createStackNavigator(
  {
    NewEvent: CreateEventScreen,
    CreateVibe: CreateVibeScreen,
    CreateMoment: CreateMomentScreen
  },
  {
    navigationOptions: {
      title: 'Create Event',
      headerTitleStyle: {
        fontWeight: '200',
        fontSize: 16
      }
    }
  }
);
const notificationsStack = createStackNavigator(
  {
    Notifications: NotificationsScreen,
    EventDetails: EventDetailsScreen
  },
  {
    navigationOptions: {
      headerTitleStyle: {
        fontWeight: '200'
      }
    }
  }
);
const profileStack = createStackNavigator(
  {
    Profile: MyProfileScreen,
    EventDetails: EventDetailsScreen, // TODO: include as component with profile icon in props
    UserDetails: UserDetailsScreen,
  },
  {
    navigationOptions: {
      headerTitleStyle: {
        fontWeight: '200'
      }
    }
  }
);

const AppStack = createBottomTabNavigator(
  {
    Recent: recentActivityStack,
    Events: eventsStack,
    'New Event': newEventStack,
    Notifications: notificationsStack,
    Profile: profileStack,
  },
  {
    initialRouteName: 'Recent',
    navigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const {routeName} = navigation.state;
        let iconName;
        if (routeName === 'Recent') {
          iconName = 'access-time'
        } else if (routeName === 'Events') {
          iconName = 'pin-drop'
        } else if (routeName === 'New Event') {
          iconName = 'add'
        } else if (routeName === 'Profile') {
          iconName = 'person'
        } else if (routeName === 'Notifications') {
          iconName = 'notifications'
        }

        return <Icon name={iconName} size={25} color={tintColor} />
      },
    }),
    tabBarOptions: {
      activeTintColor: PRIMARY_DARK_COLOR,
      inactiveTintColor: PRIMARY_LIGHT_COLOR,
      // tabStyle: { backgroundColor: }
    },
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