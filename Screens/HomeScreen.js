import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';

const FirstRoute = () => (
  <ScrollView style={styles.secondaryContainer}>
    <View style={styles.statsWrapper}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>10</Text>
        <Text style={styles.statTitle}>Total Events</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>128</Text>
        <Text style={styles.statTitle}>Total Comments</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>64</Text>
        <Text style={styles.statTitle}>Total Likes</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>8.4</Text>
        <Text style={styles.statTitle}>Viral Score</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>13</Text>
        <Text style={styles.statTitle}>Comments This Week</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>18</Text>
        <Text style={styles.statTitle}>Likes This Week</Text>
      </View>
    </View>
  </ScrollView>
);

export default class HomeScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();

    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'My Stats' },
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
  })

  _initialLayout = {
    width: Dimensions.get('window').width,
    height: 0
  }

  render() {
    return(
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <View>
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
  secondaryContainer: {
    flex: 1,
    padding: 10
  },
  statsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  stat: {
    flexBasis: '49%',
    borderWidth: 2,
    borderColor: PRIMARY_LIGHT_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    minHeight: 150
  },
  statNumber: {
    fontSize: 40,
    color: ACCENT_COLOR
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    color: ACCENT_COLOR
  },
});