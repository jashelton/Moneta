import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Avatar, Icon, Button } from 'react-native-elements';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService } from '../Services/events.service';
import { authHelper } from '../Helpers';
import { userService } from '../Services/user.service';

export default class UserDetailsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: ( navigation.getParam('getUsername') ),
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="more-horiz"
          color={PRIMARY_LIGHT_COLOR}
          onPress={navigation.getParam('toggleIsVisible')}
        />
      )
    }
  }
  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Recent Activity' },
        { key: 'second', title: 'Stats' },
      ],
      events: [], // What is passed to RecentActivity component
      currentUser: null,
      userDetails: null,
      isLoading: true
    }
  }

  componentDidMount() {
    const userId = this.props.navigation.getParam('userId', null);

    Promise.all([userService.getUserDetails(userId), eventsService.getRecentEventsById(userId), authHelper.getCurrentUserId()])
      .then(values => {
        this.setState({
          userDetails: values[0].data,
          events: values[1].data,
          currentUser: values[2],
          isLoading: false
        });

        this.props.navigation.setParams({
          getUsername: () => this.getUsername(),
        });
      })
      .catch( err => console.log(err));
  }

  getUsername() {
    return (
      <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}>
        {this.state.userDetails.name}
      </Text>
    );
  }

  _renderTabBar = props => {
    return (
      <TabBar
        {...props}
        style={{backgroundColor: PRIMARY_DARK_COLOR}}
        indicatorStyle={{ backgroundColor: ACCENT_COLOR }}
      />
    );
  };

  _initialLayout = {
    width: Dimensions.get('window').width,
    height: 0
  }

  _getInitials() {
    const { name } = this.state.userDetails;
    return name.split(" ").map((n,i,a)=> i === 0 || i+1 === a.length ? n[0] : null).join("");
  }

  render() {
    const { currentUser, userDetails, isLoading } = this.state;

    if (!isLoading) {
      return(
        <View style={styles.container}>
          <View style={styles.userInfoContainer}>
            <View style={{width: '100%'}}>
              { !isLoading && currentUser !== userDetails.id &&
                <Button
                  icon={
                    <Icon
                      name='person-add'
                      size={20}
                      color={ACCENT_COLOR}
                    />
                  }
                  title='Follow'
                  buttonStyle={{backgroundColor: PRIMARY_DARK_COLOR, justifyContent: 'flex-end', alignSelf: 'flex-end', marginRight: 15}}
                />
              }
              <Avatar
                size="xlarge"
                rounded
                source={userDetails.image ? {uri: "https://moneta-event-images.s3.amazonaws.com/user_2%2F2018-7-29_1532847192894"} : null}
                title={!userDetails.image ? this._getInitials() : null}
                onPress={() => console.log("Works!")}
                activeOpacity={0.7}
                containerStyle={{alignSelf: 'center'}}
              />
            </View>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 15}}>
            <Text style={styles.textContent}>Followers {userDetails.followers}</Text>
            <Text style={styles.textContent}>Following {userDetails.following}</Text>
          </View>
          <TabView
            navigationState={this.state}
            renderScene={SceneMap({
              first: () => <RecentActivity events={this.state.events} navigation={this.props.navigation}/>,
              second: () => <UserStats />
            })}
            renderTabBar={this._renderTabBar}
            onIndexChange={index => this.setState({ index })}
            initialLayout={this.initialLayout}
          />
        </View>
      );
    } else {
      return(
        <View style={[styles.container, {alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  rightIcon: {
    marginRight: 15
  },
  userInfoContainer: {
    height: '30%',
    width: '100%',
    flexDirection: 'column',
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  textContent: {
    color: PRIMARY_LIGHT_COLOR,
    fontSize: 16
  }
});
