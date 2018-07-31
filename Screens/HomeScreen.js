import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';

import RecentActivity from '../Components/RecentActivity';

export default class HomeScreen extends React.Component {
  // static navigationOptions = { tabBar: {visible: false} };

  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Friends' },
        { key: 'second', title: 'All' },
        { key: 'third', title: 'Notifications' },
      ],
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMap: () => this.navigateTo('Map'),
      navigateToProfile: () => this.navigateTo('UserProfile')
    });
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

  _renderScene = SceneMap({
    first: () => <RecentActivity events={[]} noDataMessage='There is no recent activity to display.'/>,
    second: () => <RecentActivity events={[]} noDataMessage='There is no recent activity to display.'/>,
    third: () => <RecentActivity events={[]} noDataMessage='You have no new notifications.'/>,
  })

  _initialLayout = {
    width: Dimensions.get('window').width,
    height: 0
  }

  render() {
    return(
      <View style={styles.container}>
        <TabView
          labelStyle={{ backgroundColor: 'red' }}
          navigationState={this.state}
          renderScene={this._renderScene}
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
});