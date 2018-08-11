import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService } from '../Services';
import { authHelper } from '../Helpers';
import { getUserDetails, updateUserDetailsFollows } from '../reducer';
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
      index: 0,
      routes: [
        { key: 'first', title: 'Recent Activity' },
        { key: 'second', title: 'Stats' },
      ],
      events: [], // What is passed to RecentActivity component
      currentUser: null,
      optionsModalVisible: false,
      editProfileModalVisible: false,
      refreshing: false,
      userId: null
    }

    this.toggleOptionsModal = this.toggleOptionsModal.bind(this);
    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
  }

  async componentDidMount() {
    const userId = this.props.navigation.getParam('userId', null);
    const currentUser = await authHelper.getCurrentUserId();

    this.setState({ currentUser, userId });

    this.props.getUserDetails(userId);

    this.props.navigation.setParams({
      toggleOptionsModal: () => this.toggleOptionsModal(),
    });

    Promise.all([eventsService.getRecentEventsById(userId)])
      .then(values => {
        this.setState({
          events: values[0].data,
        });

        this.props.navigation.setParams({
          getUsername: () => this.getUsername(),
        });
      })
      .catch( err => console.log(err));
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

  // Edit Profile
  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  async _onRefresh() {
    this.setState({ refreshing: true });
    const { data } = await eventsService.getRecentEventsById(this.state.userId);
    this.setState({ refreshing: false, events: data });
  }

  render() {
    const { currentUser, optionsModalVisible, editProfileModalVisible, imageFile, refreshing } = this.state;
    const { userDetails, loading } = this.props;

    if (!loading && userDetails) {
      return(
        <View style={styles.container}>
          <UserInfo
            userDetails={userDetails}
            currentUser={currentUser}
            toggleEditProfile={this.toggleEditProfile}
            toggleFollowing={() => this.toggleFollowing()}
          />
          <TabView
            navigationState={this.state}
            renderScene={SceneMap({
              first: () =>  <RecentActivity
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
    userDetails: state.userDetails
  };
};

const mapDispatchToProps = {
  getUserDetails,
  updateUserDetailsFollows
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailsScreen);
