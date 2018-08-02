import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';
import { eventsService } from '../Services';

export default class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Recent Events' };
  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Following' },
        { key: 'second', title: 'Everyone' },
      ],
      data: null,
      followingEvents: null,
      allEvents: null
    }
  }

  componentDidMount() {
    Promise.all([eventsService.getRecentEvents('following'), eventsService.getRecentEvents('all')])
      .then(following => {
        this.setState({followingEvents: following[0].data, allEvents: following[1].data});
      })
      .catch(err => console.log(err));
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
    const { navigation } = this.props;
    const { followingEvents, allEvents } = this.state;
    return(
      <View style={styles.container}>
        { this.state.allEvents && this.state.followingEvents &&
          <TabView
            navigationState={this.state}
            renderScene={SceneMap({
              first: () => <RecentActivity navigation={navigation} events={followingEvents} noDataMessage='There is no recent activity to display.'/>,
              second: () => <RecentActivity navigation={navigation} events={allEvents} noDataMessage='There is no recent activity to display.'/>,
            })}
            renderTabBar={this._renderTabBar}
            onIndexChange={index => this.setState({ index })}
            initialLayout={this.initialLayout}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
});
