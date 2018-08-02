import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Avatar, Icon, Button } from 'react-native-elements';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService } from '../Services/events.service';
import { authHelper } from '../Helpers';

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
      userId: null
    }
  }

  async testing() {
    const userId = this.props.currentUser ? await authHelper.getCurrentUserId() : this.props.navigation.getParam('userId', null);
    this.setState({userId});

    return userId;
  }

  getUsername() {
    return <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}> Justin Shelton </Text>
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      getUsername: () => this.getUsername(),
    });

    // This feels really gross
    await this.testing();
    const { data } = await eventsService.getRecentEventsById(this.state.userId); // TODO: Don't hardcode params... refactor to GET /events/:?
    this.setState({events: data});
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

  render() {
    return(
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <View>
            <Avatar
              size="xlarge"
              rounded
              source={{uri: "https://moneta-event-images.s3.amazonaws.com/user_2%2F2018-7-29_1532847192894"}}
              onPress={() => console.log("Works!")}
              activeOpacity={0.7}
            />
          </View>
          {/* <View>
            <Text style={styles.userContentBody}>Justin Shelton</Text>
            <Text style={styles.userContentBody}>Durham, NC</Text>
            <Button
              raised={true}
              icon={
                <Icon
                  name='person-add'
                  size={20}
                  color={PRIMARY_DARK_COLOR}
                />
              }
              title='Follow'
              buttonStyle={{backgroundColor: ACCENT_COLOR, width: '100%'}}
            />
          </View> */}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <Text style={styles.textContent}>128 Followers</Text>
          <Text style={styles.textContent}>32 Following</Text>
        </View>
        <TabView
          labelStyle={{ backgroundColor: 'red' }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContent: {
    color: PRIMARY_LIGHT_COLOR,
    fontSize: 16
  }
});
