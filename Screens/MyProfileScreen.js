import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, AppState } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { Icon } from 'react-native-elements';
import RecentActivity from '../Components/RecentActivity';
import { authHelper } from '../Helpers';
import UserInfo from '../Components/UserInfo';
import UserStats from '../Components/UserStats';
import { clearErrors,
         getCurrentUserDetails,
         getCurrentUserStats,
         updateCurrentUserDetails,
         listRecentActivityForCurrentUser,
         loadMoreRowsForCurrentUserActivity } from '../reducer';
import SnackBar from 'react-native-snackbar-component'
import EditProfileModal from '../Components/EditProfileModal';
import FollowsModal from '../Components/FollowsModal';
import { userService } from '../Services';

class MyProfileScreen extends React.Component {
  // static navigationOptions = { title: 'My Profile' };
  static navigationOptions = { header: null };

  constructor() {
    super();

    this.state = {
      currentUser: null,
      editProfileModalVisible: false,
      refreshing: false,
      sliderActiveSlide: 0,
      followsModalVisibility: false,
      followsList: null,
      appState: AppState.currentState
    }

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this.toggleFollowsModal = this.toggleFollowsModal.bind(this);
    this._navigateToUser = this._navigateToUser.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    const currentUser = await authHelper.getCurrentUserId();
    this.setState({ currentUser });

    this.fetchUserDetails();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.fetchUserDetails();
    }
    this.setState({appState: nextAppState});
  }

  async fetchUserDetails() {
    if (this.props.error) this.props.clearErrors();
    const { currentUser } = this.state;

    try {
      const userDetails = await this.props.getCurrentUserDetails(currentUser);
      const userStats = await this.props.getCurrentUserStats(currentUser);
      const activity = await this.props.listRecentActivityForCurrentUser(currentUser, 0);

      if (userDetails.error) throw(userDetails.error);
      if (userStats.error) throw(userStats.error);
      if (activity.error) throw(activity.error);

    } catch(err) {
      throw(err);
    }
  }

  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  async toggleFollowsModal(type) {
    if (type) {
      const { data } = await userService.getFollows(this.state.currentUser, type);
      this.setState({ followsList: data });
    }
    const { followsModalVisibility } = this.state;

    this.setState({ followsModalVisibility: !followsModalVisibility });
  }

  _navigateToUser(userId) {
    this.toggleFollowsModal();
    // TODO: This causes an issue with routing.
    this.props.navigation.navigate('UserDetails', { userId });
  }

  async _onRefresh() {
    this.setState({ refreshing: true });
    this.fetchUserDetails();
    this.setState({ refreshing: false });
  }

  handleScroll(offset) {
    if (!this.props.loading && offset >= 10) {
      this.props.loadMoreRowsForCurrentUserActivity(this.state.currentUser, offset);
    }
  }

  _renderItem ({item, index}) {
    if (index === 0) {
      return (
        <UserInfo
          userDetails={item}
          currentUser={this.state.currentUser}
          toggleEditProfile={this.toggleEditProfile}
          toggleFollowing={() => this.toggleFollowing()}
          toggleFollowsModal={(data) => this.toggleFollowsModal(data)}
        />
      );
    } else if (index === 1) {
      return (
        <UserStats stats={item} />
      );
    }
  }

  render() {
    const { currentUserDetails, currentUserStats, currentUserActivity, loading, error } = this.props;
    const { editProfileModalVisible,
            refreshing,
            sliderActiveSlide,
            followsModalVisibility,
            followsList } = this.state;
    const { width } = Dimensions.get('window');
    const carouselElements = [currentUserDetails, currentUserStats];

    if (loading) {
      return(
        <View>
          <ActivityIndicator />
        </View>
      );
    }

    if (currentUserDetails.id && !error) {
      return(
        <View style={styles.container}>
          <View style={{height: '40%'}}>
            <Carousel
              ref={(c) => { this._carousel = c; }}
              data={carouselElements}
              renderItem={this._renderItem}
              sliderWidth={width}
              itemWidth={width}
              onSnapToItem={(index) => this.setState({ sliderActiveSlide: index })}
              layout={'default'}
            />
            <Pagination
              dotsLength={carouselElements.length}
              activeDotIndex={sliderActiveSlide}
              containerStyle={styles.paginationContainer}
              dotColor={ACCENT_COLOR}
              dotStyle={styles.paginationDot}
              inactiveDotColor='#1a1917'
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
              carouselRef={this._slider1Ref}
              tappableDots={!!this._slider1Ref}
            />
          </View>
          <View style={styles.container}>
            <RecentActivity
              events={currentUserActivity}
              navigation={this.props.navigation}
              refreshing={refreshing}
              _onRefresh={this._onRefresh}
              handleScroll={this.handleScroll}
            />
          </View>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isVisible={editProfileModalVisible}
            toggleEditProfile={this.toggleEditProfile}
            userDetails={currentUserDetails}
          />

          {/* Follows Modal */}
          <FollowsModal
            isVisible={followsModalVisibility}
            toggleFollowsModal={() => this.toggleFollowsModal()}
            followsList={followsList}
            navigateToUser={(userId) => this._navigateToUser(userId)}
          />
        </View>
      );
    } else {
      return(
        <View style={styles.container}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              containerStyle={styles.rightIcon}
              size={36}
              name='refresh'
              color={PRIMARY_DARK_COLOR}
              onPress={() => this.fetchUserDetails()}
            />
          </View>
          <SnackBar
            visible={error ? true : false}
            textMessage={error}
            actionHandler={() => this.props.clearErrors()}
            actionText="close"
          />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfoContainer: {
    height: Dimensions.get('window').height * 0.6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Pagination
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5
  },
  paginationContainer: {
    paddingVertical: 10,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  // End Pagination
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    currentUserDetails: state.currentUserDetails,
    currentUserStats: state.currentUserStats,
    currentUserActivity: state.currentUserActivity,
    error: state.error
  };
};

const mapDispatchToProps = {
  getCurrentUserDetails,
  getCurrentUserStats,
  updateCurrentUserDetails,
  listRecentActivityForCurrentUser,
  loadMoreRowsForCurrentUserActivity,
  clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(MyProfileScreen);