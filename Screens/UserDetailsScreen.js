import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_COLOR, PRIMARY_LIGHT_COLOR, TEXT_ICONS_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Avatar, Icon, Button, Divider } from 'react-native-elements';
import { Constants } from 'expo';
import { TextField } from 'react-native-material-textfield';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import { RNS3 } from 'react-native-aws3';
import { connect } from 'react-redux';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService, userService } from '../Services';
import { authHelper, commonHelper } from '../Helpers';
import { getUserDetails, updateUserDetailsFollows } from '../reducer';

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

  options = {
    keyPrefix: '',
    bucket: BUCKET,
    region: BUCKET_REGION,
    accessKey: AWS_ACCESS_KEY,
    secretKey: AWS_SECRET_ACCESS_KEY,
    successActionStatus: 201
  };

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
      imageFile: null,
    }

    this.toggleOptionsModal = this.toggleOptionsModal.bind(this);
    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this.prepS3Upload = this.prepS3Upload.bind(this);
    this.submitUpdatedUser = this.submitUpdatedUser.bind(this);
  }

  async componentDidMount() {
    const userId = this.props.navigation.getParam('userId', null);
    this.props.getUserDetails(userId);

    this.props.navigation.setParams({
      toggleOptionsModal: () => this.toggleOptionsModal(),
    });

    Promise.all([eventsService.getRecentEventsById(userId), authHelper.getCurrentUserId()])
      .then(values => {
        this.setState({
          events: values[0].data,
          currentUser: values[1],
        });
        this.options.keyPrefix = `user_${values[1]}/`;

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

  _getInitials() {
    const { userDetails } = this.props;
    if (userDetails.name) {
      return userDetails.name.split(' ').map((n,i,a)=> i === 0 || i+1 === a.length ? n[0] : null).join('');
    }
  }

  // Edit Profile
  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}_${now}`;
  }

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    const result = await commonHelper.selectImage(false);

    if (!result.cancelled) {
      const { imageFile } = this.state;
      imageFile = { uri: result.uri, name: this.createDateString(), type: result.type }; // Required fields for S3 upload
      this.setState({ imageFile });
    }
  }

  async submitUpdatedUser() {
    let { imageFile } = this.state;
    const { userDetails } = this.props;
    const { id, first_name, last_name, username } = userDetails;
    const user = {
      id,
      first_name,
      last_name,
      username
    };

    try {
      if (imageFile && imageFile.uri) {
        const s3Upload = await RNS3.put(imageFile, this.options);
        user.profile_image = s3Upload.body.postResponse.location;
      }

      const { data } = await userService.updateUserDetails(user);

      this.setState({ editProfileModalVisible: false });
    } catch (err) {
      console.log(err);
      return;
    }
  }

  render() {
    const { currentUser, optionsModalVisible, editProfileModalVisible, imageFile } = this.state;
    const { userDetails, loading } = this.props;

    if (!loading) {
      return(
        <View style={styles.container}>
          <View style={[styles.userInfoContainer, { backgroundColor: PRIMARY_DARK_COLOR }]}>
            <View style={{width: '100%'}}>
              { currentUser !== userDetails.id ?
                <Button
                  title={userDetails.isFollowing ? 'Unfollow' : 'Follow'}
                  buttonStyle={styles.mainBtn}
                  titleStyle={{ color: TEXT_ICONS_COLOR }}
                  onPress={() => this.toggleFollowing()}
                />
                :
                <Button
                  title='Edit Profile'
                  buttonStyle={styles.mainBtn}
                  onPress={this.toggleEditProfile}
                />
              }
              <Avatar
                size="xlarge"
                rounded
                source={userDetails.profile_image ? {uri: userDetails.profile_image} : null}
                title={!userDetails.profile_image ? this._getInitials() : null}
                activeOpacity={0.7}
                containerStyle={{alignSelf: 'center'}}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 15}}>
              <Text style={styles.textContent}>Followers {userDetails.followers}</Text>
              <Text style={styles.textContent}>Following {userDetails.following}</Text>
            </View>
          </View>
          <TabView
            navigationState={this.state}
            renderScene={SceneMap({
              first: () => <RecentActivity events={this.state.events} navigation={this.props.navigation}/>,
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
          <Modal
            animationType="slide"
            transparent={false}
            visible={editProfileModalVisible}
          >
            <View style={styles.modalHeader}>
              <Button title='Cancel' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.toggleEditProfile}/>
              <Button title='Done' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.submitUpdatedUser}/>
            </View>
            <View style={styles.editImageContainer}>
              <Avatar
                size="xlarge"
                rounded
                source={
                  userDetails.profile_image ?
                  { uri: userDetails.profile_image } :
                  imageFile && imageFile.uri ?
                  { uri: imageFile.uri } :
                  null
                }
                icon={ userDetails.profile_image ? null : {name: 'add-a-photo'}}
                activeOpacity={0.7}
                onPress={this.prepS3Upload}
              />
            </View>
            <Divider />
            <View style={styles.editProfileBody}>
              <TextField
                label='First Name'
                value={userDetails.first_name}
                onChangeText={(first_name) => this.setState({ userDetails: { ...userDetails, first_name } }) }
              />
              <TextField
                label='Last Name'
                value={userDetails.last_name}
                onChangeText={(last_name) => this.setState({ userDetails: { ...userDetails, last_name } }) }
              />
              <TextField
                label='Username'
                value={userDetails.username || ''}
                onChangeText={(username) => this.setState({ userDetails: { ...userDetails, username } }) }
              />
            </View>
          </Modal>
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
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: '#eee',
  },
  rightIcon: {
    marginRight: 15
  },
  userInfoContainer: {
    // height: '30%',
    width: '100%',
    flexDirection: 'column',
    backgroundColor: '#eee',
    paddingTop: 15,
    paddingBottom: 15
  },
  textContent: {
    color: TEXT_ICONS_COLOR,
    fontSize: 16
  },
  mainBtn: {
    backgroundColor: PRIMARY_DARK_COLOR,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 15,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
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
