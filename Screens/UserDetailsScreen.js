import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';

import RecentActivity from '../Components/RecentActivity';
import { authHelper } from '../Helpers';
import { getUserDetails, updateUserDetailsFollows, listRecentActivityForUser, loadMoreRowsForUserActivity } from '../reducer';
import UserInfo from '../Components/UserInfo';
import EditProfileModal from '../Components/EditProfileModal';

class UserDetailsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: ( navigation.getParam('getUsername') ),
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="more-horiz"
          color={PRIMARY_LIGHT_COLOR}
          onPress={navigation.getParam('toggleOptionsModal')}
        />
      )
    }
  }

  constructor() {
    super();

    this.state = {
      currentUser: null,
      optionsModalVisible: false,
      editProfileModalVisible: false,
      refreshing: false,
      userId: null
    }

    this.toggleOptionsModal = this.toggleOptionsModal.bind(this);
    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    const userId = this.props.navigation.getParam('userId', null);
    const currentUser = await authHelper.getCurrentUserId();

    this.setState({ currentUser, userId });

    this.props.getUserDetails(userId);
    this.props.listRecentActivityForUser(userId, 0);;

    this.props.navigation.setParams({
      toggleOptionsModal: () => this.toggleOptionsModal(),
      getUsername: () => this.getUsername(),
    });
  }

  getUsername() {
    return (
      <Text style={{color: PRIMARY_LIGHT_COLOR, fontWeight: '200', fontSize: 18}}>
        {this.props.userDetails.name}
      </Text>
    );
  }

  toggleFollowing() {
    const { userDetails, updateUserDetailsFollows } = this.props;
    updateUserDetailsFollows(userDetails.id, !userDetails.isFollowing);
  }

  toggleOptionsModal() {
    const { optionsModalVisible } = this.state;
    this.setState({ optionsModalVisible: !optionsModalVisible });
  }

  // Edit Profile
  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.props.listRecentActivityForUser(this.state.userId, 0);
    this.setState({ refreshing: false });
  }

  handleScroll(offset) {
    if (!this.props.loading) {
      this.props.loadMoreRowsForUserActivity(this.state.userId, offset);
    }
  }

  render() {
    const { currentUser, optionsModalVisible, editProfileModalVisible, imageFile, refreshing } = this.state;
    const { userDetails, userActivity } = this.props;

    if (userActivity && userDetails) {
      return(
        <View style={styles.container}>
          <UserInfo
            userDetails={userDetails}
            currentUser={currentUser}
            toggleEditProfile={this.toggleEditProfile}
            toggleFollowing={() => this.toggleFollowing()}
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
          {/* Options Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={optionsModalVisible}
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
        </View>
      );
    } else {
      return(
        <View style={[styles.container, {alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator />
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
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    userDetails: state.userDetails,
    userActivity: state.userActivity
  };
};

const mapDispatchToProps = {
  getUserDetails,
  updateUserDetailsFollows,
  listRecentActivityForUser,
  loadMoreRowsForUserActivity
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailsScreen);
