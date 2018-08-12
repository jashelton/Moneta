import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';

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
      refreshing: false
    }

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
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
        { this.props.currentUserDetails.name }
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

  render() {
    const { currentUserDetails, userActivity } = this.props;
    const { currentUser, editProfileModalVisible, refreshing } = this.state;

    if (userActivity && currentUserDetails) {
      return(
        <View style={styles.container}>
          <UserInfo
            userDetails={currentUserDetails}
            currentUser={currentUser}
            toggleEditProfile={this.toggleEditProfile}
          />
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