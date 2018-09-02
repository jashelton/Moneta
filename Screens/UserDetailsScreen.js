import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, Dimensions, AppState } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { Button, Divider, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import RecentActivity from '../Components/RecentActivity';
import { authHelper } from '../Helpers';
import { getUserDetails,
         updateUserDetailsFollows,
         listRecentActivityForUser,
         loadMoreRowsForUserActivity,
         getUserStats,
         clearErrors } from '../reducer';
import UserInfo from '../Components/UserInfo';
import UserStats from '../Components/UserStats';
import SnackBar from 'react-native-snackbar-component'
import EditProfileModal from '../Components/EditProfileModal';
import FollowsModal from '../Components/FollowsModal';
import { userService } from '../Services';

class UserDetailsScreen extends React.Component {
  // static navigationOptions = { header: null };
  // static navigationOptions = ({navigation}) => {
  //   return {
  //     headerTitle: ( navigation.getParam('getUsername') ),
  //     // headerRight: (
  //     //   <Icon
  //     //     containerStyle={styles.rightIcon}
  //     //     size={28}
  //     //     name="more-horiz"
  //     //     color={PRIMARY_LIGHT_COLOR}
  //     //     onPress={navigation.getParam('toggleOptionsModal')}
  //     //   />
  //     // )
  //   }
  // }

  constructor() {
    super();

    this.state = {
      currentUser: null,
      optionsModalVisible: false,
      editProfileModalVisible: false,
      followsModalVisibility: false,
      refreshing: false,
      userId: null,
      sliderActiveSlide: 0,
      followsList: null,
      appState: AppState.currentState
    }

    this.toggleOptionsModal = this.toggleOptionsModal.bind(this);
    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this._renderItem = this._renderItem.bind(this);
    this.toggleFollowsModal = this.toggleFollowsModal.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    const userId = this.props.navigation.getParam('userId', null);
    const currentUser = await authHelper.getCurrentUserId();

    this.setState({ currentUser, userId });

    this.fetchUserDetails();

    this.props.navigation.setParams({
      toggleOptionsModal: () => this.toggleOptionsModal(),
      getUsername: () => this.getUsername(),
    });
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
    const { userId } = this.state;

    try {
      const userDetails = await this.props.getUserDetails(userId);
      const userStats = await this.props.getUserStats(userId);
      const activity = await this.props.listRecentActivityForUser(userId, 0);

      if (userDetails.error) throw(userDetails.error);
      if (userStats.error) throw(userStats.error);
      if (activity.error) throw(activity.error);
    } catch(err) {
      throw(err);
    }
  }

  getUsername() {
    const { userDetails } = this.props;
    if (userDetails && userDetails.name) {
      return (
        <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}>
          {this.props.userDetails.name}
        </Text>
      );
    } else {
      return (
        <Text></Text>
      )
    }
  }

  toggleFollowing() {
    const { userDetails, updateUserDetailsFollows } = this.props;
    updateUserDetailsFollows(userDetails.id, !userDetails.isFollowing);
  }

  toggleOptionsModal() {
    const { optionsModalVisible } = this.state;
    this.setState({ optionsModalVisible: !optionsModalVisible });
  }

  async toggleFollowsModal(type) {
    if (type) {
      const { data } = await userService.getFollows(this.state.userId, type);
      this.setState({ followsList: data });
    }
    const { followsModalVisibility } = this.state;

    this.setState({ followsModalVisibility: !followsModalVisibility });
  }

  _navigateToUser(userId) {
    this.toggleFollowsModal();
    // TODO: This causes an issue with routing.
    this.props.navigation.replace('UserDetails', { userId });
  }

  // Edit Profile
  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.fetchUserDetails();
    this.setState({ refreshing: false });
  }

  handleScroll(offset) {
    if (!this.props.loading && offset > 4) {
      this.props.loadMoreRowsForUserActivity(this.state.userId, offset);
    }
  }

  _renderItem ({item, index}) {
    if (index === 0) {
      return (
        <UserInfo
          userDetails={item}
          currentUser={this.state.currentUser}
          toggleEditProfile={this.toggleEditProfile}
          toggleFollowsModal={(data) => this.toggleFollowsModal(data)}
          toggleFollowing={() => this.toggleFollowing()}
        />
      );
    } else if (index === 1) {
      return (
        <UserStats stats={item} />
      );
    }
  }

  render() {
    const { optionsModalVisible,
            editProfileModalVisible,
            imageFile,
            refreshing,
            sliderActiveSlide,
            followsModalVisibility,
            followsList } = this.state;
    const { userDetails, userStats, userActivity, loading, error } = this.props;
    const { width } = Dimensions.get('window');
    const carouselElements = [userDetails, userStats];

    if (loading && !error) {
      return(
        <View>
          <ActivityIndicator />
        </View>
      );
    }

    if (userDetails.id) {
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
              dotsLength={carouselElements.length} // TODO: don't hardcode
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
          <Divider />
          <View style={{flex: 1}}>
            <RecentActivity
              events={userActivity}
              navigation={this.props.navigation}
              refreshing={refreshing}
              _onRefresh={this._onRefresh}
              handleScroll={this.handleScroll}
            />
          </View>
          {/* Options Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={optionsModalVisible}
            onRequestClose={this.toggleOptionsModal}
          >
            <View style={styles.modalHeader}>
              <Button title='Cancel' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.toggleOptionsModal}/>
              <Button title='Done' titleStyle={{color: ACCENT_COLOR}} clear={true}/>
            </View>
            <View style={{flexDirection: 'column', padding: 15}}>
              <Text>Other options</Text>
            </View>
          </Modal>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isVisible={editProfileModalVisible}
            toggleEditProfile={this.toggleEditProfile}
            imageFile={imageFile}
            userDetails={userDetails}
          />

          {/* Follows Modal */}
          <FollowsModal
            isVisible={followsModalVisibility}
            toggleFollowsModal={() => this.toggleFollowsModal()}
            followsList={followsList}
            navigation={this.props.navigation}
            navigateToUser={(user) => this._navigateToUser(user)}
          />

          <SnackBar
            visible={error ? true : false}
            textMessage={error}
            actionHandler={() => this.props.clearErrors()}
            actionText="close"
          />
        </View>
      );
    } else {
      return(
        <View style={styles.container}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
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
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightIcon: {
    marginRight: 15
  },
  modalHeader: {
    height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  editImageContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25
  },
  editProfileBody: {
    padding: 15
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
    userDetails: state.userDetails,
    userStats: state.userStats,
    userActivity: state.userActivity,
    error: state.error
  };
};

const mapDispatchToProps = {
  getUserDetails,
  updateUserDetailsFollows,
  listRecentActivityForUser,
  loadMoreRowsForUserActivity,
  getUserStats,
  clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailsScreen);
