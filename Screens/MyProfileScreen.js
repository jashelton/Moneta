import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';

import RecentActivity from '../Components/RecentActivity';
import { authHelper } from '../Helpers';
import UserInfo from '../Components/UserInfo';
import { getCurrentUserDetails, updateCurrentUserDetails, listRecentActivityForUser, loadMoreRowsForUserActivity } from '../reducer';
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
      currentUser: null,
      editProfileModalVisible: false,
      refreshing: false,
      sliderActiveSlide: 0
    }

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this._renderItem = this._renderItem.bind(this);
  }

  async componentDidMount() {
    const currentUser = await authHelper.getCurrentUserId();
    this.props.getCurrentUserDetails(currentUser); // TODO: This could be it's on getCurrentUserDetails()
    this.props.listRecentActivityForUser(currentUser, 0);
    this.setState({ currentUser });

    // TODO: Find a better way to handle this.
    setTimeout(() => {
      this.props.navigation.setParams({ getUsername: () => this.getUsername() });
    }, 250);
  }

  getUsername() {
    return (
      <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}>
        { this.props.currentUserDetails[0].name }
      </Text>
    );
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
        />
      );
    } else if (index === 1) {
      return (
        <View style={{flex: 1, backgroundColor: PRIMARY_DARK_COLOR}}>
          <Text>Countries Visited: {item.num_countries}</Text>
        </View>
      );
    }
  }

  render() {
    const { currentUserDetails, userActivity } = this.props;
    const { editProfileModalVisible, refreshing, sliderActiveSlide } = this.state;
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