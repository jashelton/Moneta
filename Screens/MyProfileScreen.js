import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import RecentActivity from '../Components/RecentActivity';
import { authHelper } from '../Helpers';
import UserInfo from '../Components/UserInfo';
import UserStats from '../Components/UserStats';
import { getCurrentUserDetails, updateCurrentUserDetails, listRecentActivityForUser, loadMoreRowsForUserActivity } from '../reducer';
import EditProfileModal from '../Components/EditProfileModal';
import FollowsModal from '../Components/FollowsModal';
import { userService } from '../Services';

class MyProfileScreen extends React.Component {
  static navigationOptions = { title: 'My Profile' };

  constructor() {
    super();

    this.state = {
      currentUser: null,
      editProfileModalVisible: false,
      refreshing: false,
      sliderActiveSlide: 0,
      followsModalVisibility: false,
      followsList: null
    }

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this.toggleFollowsModal = this.toggleFollowsModal.bind(this);
    this._navigateToUser = this._navigateToUser.bind(this);
  }

  async componentDidMount() {
    const currentUser = await authHelper.getCurrentUserId();
    this.props.getCurrentUserDetails(currentUser); // TODO: This could be it's on getCurrentUserDetails()
    this.props.listRecentActivityForUser(currentUser, 0);
    this.setState({ currentUser });
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
    this.props.listRecentActivityForUser(this.state.currentUser, 0);
    this.setState({ refreshing: false });
  }

  handleScroll(offset) {
    if (!this.props.loading) {
      this.props.loadMoreRowsForUserActivity(this.state.currentUser, offset);
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
    const { currentUserDetails, userActivity } = this.props;
    const { editProfileModalVisible,
            refreshing,
            sliderActiveSlide,
            followsModalVisibility,
            followsList } = this.state;
    const { width } = Dimensions.get('window');

    if (userActivity && currentUserDetails && currentUserDetails.length) {
      return(
        <View style={styles.container}>
          <View style={{height: '40%'}}>
            <Carousel
              ref={(c) => { this._carousel = c; }}
              data={currentUserDetails}
              renderItem={this._renderItem}
              sliderWidth={width}
              itemWidth={width - 4}
              onSnapToItem={(index) => this.setState({ sliderActiveSlide: index })}
              layout={'default'}
            />
            <Pagination
              dotsLength={currentUserDetails.length}
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
              events={userActivity}
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
            userDetails={currentUserDetails[0]}
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
  },
  userInfoContainer: {
    height: '30%',
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
    marginLeft: 2,
    marginRight: 2
  },
  // End Pagination
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    currentUserDetails: state.currentUserDetails,
    userActivity: state.userActivity
  };
};

const mapDispatchToProps = {
  getCurrentUserDetails,
  updateCurrentUserDetails,
  listRecentActivityForUser,
  loadMoreRowsForUserActivity
};

export default connect(mapStateToProps, mapDispatchToProps)(MyProfileScreen);