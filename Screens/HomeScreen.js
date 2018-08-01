import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';

export default class HomeScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Friends' },
        { key: 'second', title: 'All' },
      ],
      data: null
    }
  }

  componentDidMount() {
    // Figure out how to fetch data on tab change
    // If not -> Promise.resolve.all for two api calls
    let { data } = this.state;
    setTimeout(() => {
      data = {
        all: [{ name: 'Name', image: 'https://moneta-event-images.s3.amazonaws.com/user_2%2F2018-7-29_1532847192894', title: 'All', id: 1}],
        friends: [{ name: 'Name', image: 'https://moneta-event-images.s3.amazonaws.com/user_2%2F2018-7-29_1532847192894', title: 'Friends', id: 1}],
      }
      this.setState({data});
      console.log(this.state);
    }, 100)
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
        { this.state.data &&
          <TabView
            navigationState={this.state}
            renderScene={SceneMap({
              first: () => <RecentActivity events={this.state.data.friends} noDataMessage='There is no recent activity to display.'/>,
              second: () => <RecentActivity events={this.state.data.all} noDataMessage='There is no recent activity to display.'/>,
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
    paddingTop: Constants.statusBarHeight,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
});
