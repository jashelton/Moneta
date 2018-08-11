import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Constants } from 'expo';
import { connect } from 'react-redux';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService } from '../Services/events.service';
import { authHelper } from '../Helpers';
import UserInfo from '../Components/UserInfo';
import { getCurrentUserDetails, updateCurrentUserDetails } from '../reducer';
import EditProfileModal from '../Components/EditProfileModal';

class MyProfileScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: ( navigation.getParam('getUsername') ),
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
      editProfileModalVisible: false,
      refreshing: false
    }

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  async componentDidMount() {
    const currentUser = await authHelper.getCurrentUserId();
    this.props.getCurrentUserDetails(currentUser); // TODO: This could be it's on getCurrentUserDetails()

    const { data } = await eventsService.getRecentEventsById(currentUser); // TODO: Don't hardcode params... refactor to GET /events/:?
    this.setState({ events: data, currentUser });

    // TODO: Find a better way to handle this.
    setTimeout(() => {
      this.props.navigation.setParams({ getUsername: () => this.getUsername() });
    }, 250);
  }

  getUsername() {
    return (
      <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}>
        { this.props.currentUserDetails.name }
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

  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });

    // TODO: Find a better way to handle this.
    setTimeout(() => {
      this.props.navigation.setParams({ getUserName: () => getUsername });
    }, 250);
  }

  async _onRefresh() {
    this.setState({ refreshing: true });
    const { data } = await eventsService.getRecentEventsById(this.state.currentUser);
    this.setState({ refreshing: false, events: data });
  }

  render() {
    const { currentUserDetails, loading } = this.props;
    const { currentUser, editProfileModalVisible, refreshing } = this.state;

    if (!loading && currentUserDetails) {
      return(
        <View style={styles.container}>
          <UserInfo
            userDetails={currentUserDetails}
            currentUser={currentUser}
            toggleEditProfile={this.toggleEditProfile}
          />
          <TabView
            labelStyle={{ backgroundColor: 'red' }}
            navigationState={this.state}
            renderScene={SceneMap({
              first: () => <RecentActivity
                              events={this.state.events}
                              navigation={this.props.navigation}
                              refreshing={refreshing}
                              _onRefresh={this._onRefresh}
                            />,
              second: () => <UserStats />
            })}
            renderTabBar={this._renderTabBar}
            onIndexChange={index => this.setState({ index })}
            initialLayout={this.initialLayout}
          />

          {/* Edit Profile Modal */}
          <EditProfileModal
            isVisible={editProfileModalVisible}
            toggleEditProfile={this.toggleEditProfile}
            userDetails={currentUserDetails}
          />
        </View>
      );
    } else {
      return(
        <View>
          <ActivityIndicator />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: PRIMARY_DARK_COLOR,
  },
  userInfoContainer: {
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    currentUserDetails: state.currentUserDetails
  };
};

const mapDispatchToProps = {
  getCurrentUserDetails,
  updateCurrentUserDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(MyProfileScreen);