import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';

const FirstRoute = () => (
  <ScrollView style={[styles.container, { backgroundColor: PRIMARY_LIGHT_COLOR }]}>
    <Text>First</Text>
  </ScrollView>
);
const SecondRoute = () => (
  <View style={[styles.container, { backgroundColor: PRIMARY_LIGHT_COLOR }]}>
    <Text>Second</Text>
  </View>
);

export default class HomeScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'My Stats' },
        { key: 'second', title: 'Trending' },
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
    first: FirstRoute,
    second: SecondRoute,
  })

  _initialLayout = {
    width: Dimensions.get('window').width,
    height: 0
  }

  render() {
    return(
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <View style={{flex: 1}}>
            <View style={styles.headerSection}>
              <Icon
                containerStyle={styles.leftIcon}
                size={28}
                name="person"
                color={ACCENT_COLOR}
                onPress={() => this.props.navigation.navigate('UserProfile')}
              />
              <Icon
                containerStyle={styles.rightIcon}
                size={28}
                name="pin-drop"
                color={ACCENT_COLOR}
                onPress={() => this.props.navigation.navigate('Map')}
              />
            </View>
          </View>
        </View>
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
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight,
    paddingLeft: 15,
    paddingRight: 15
  },
  // rightIcon: {
  //   marginRight: 10
  // },
  // leftIcon: {
  //   marginLeft: 10
  // },
  userInfoContainer: {
    height: '30%',
  },
});