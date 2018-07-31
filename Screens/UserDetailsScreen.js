import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Avatar } from 'react-native-elements';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService } from '../Services/events.service';

export default class UserDetailsScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Recent Activity' },
        { key: 'second', title: 'Stats' },
      ],
      events: [] // What is passed to RecentActivity component
    }
  }

  async componentDidMount() {
    const { data } = await eventsService.getEvents('Me'); // TODO: Don't hardcode params... refactor to GET /events/:?
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
          <Avatar
            size="xlarge"
            rounded
            source={{uri: "https://moneta-event-images.s3.amazonaws.com/user_2%2F2018-7-29_1532847192894"}}
            onPress={() => console.log("Works!")}
            activeOpacity={0.7}
          />
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
  userInfoContainer: {
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
