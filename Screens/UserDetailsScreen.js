import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { PRIMARY_DARK_COLOR, ACCENT_COLOR, PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { Avatar, Icon, Button, Divider } from 'react-native-elements';
import { Constants, ImagePicker, Permissions } from 'expo';
import { TextField } from 'react-native-material-textfield';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import { RNS3 } from 'react-native-aws3';

import RecentActivity from '../Components/RecentActivity';
import UserStats from '../Components/UserStats';
import { eventsService, userService } from '../Services';
import { authHelper } from '../Helpers';

export default class UserDetailsScreen extends React.Component {
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
      userDetails: null,
      isLoading: true,
      optionsModalVisible: false,
      editProfileModalVisible: false,
      imageFile: null,
    }

    this.toggleFollowing = this.toggleFollowing.bind(this);
    this.toggleOptionsModal = this.toggleOptionsModal.bind(this);
    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this.prepS3Upload = this.prepS3Upload.bind(this);
    this.submitUpdatedUser = this.submitUpdatedUser.bind(this);
  }

  async componentDidMount() {
    const user_data = await authHelper.getParsedUserData();
    this.options.keyPrefix = `user_${user_data.id}/`;

    const userId = this.props.navigation.getParam('userId', null);
    this.props.navigation.setParams({
      toggleOptionsModal: () => this.toggleOptionsModal(),
    });

    Promise.all([userService.getUserDetails(userId), eventsService.getRecentEventsById(userId), authHelper.getCurrentUserId()])
      .then(values => {
        this.setState({
          userDetails: values[0].data,
          events: values[1].data,
          currentUser: values[2],
          isLoading: false
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
        {this.state.userDetails.name}
      </Text>
    );
  }

  async toggleFollowing() {
    const { userDetails } = this.state;

    try {
      const { data } = await userService.toggleFollowing(userDetails.id, !userDetails.isFollowing);

      userDetails.isFollowing ? userDetails.followers -- : userDetails.followers ++;
      userDetails.isFollowing = !userDetails.isFollowing;
      this.setState({userDetails});
    } catch(err) {
      console.log(err);
    }
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
    const { name } = this.state.userDetails;
    return name.split(' ').map((n,i,a)=> i === 0 || i+1 === a.length ? n[0] : null).join('');
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
    let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access camera roll was denied',
      });
    }

    const result = await ImagePicker.launchImageLibraryAsync({ // Require type image
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      const { imageFile } = this.state;
      imageFile = { uri: result.uri, name: this.createDateString(), type: result.type }; // Required fields for S3 upload
      this.setState({ imageFile });
    }
  }

  async submitUpdatedUser() {
    let { imageFile, userDetails } = this.state;
    const { id, first_name, last_name } = userDetails;
    const user = {
      id,
      first_name,
      last_name,
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
    const { currentUser, userDetails, isLoading, optionsModalVisible, editProfileModalVisible, imageFile } = this.state;

    if (!isLoading) {
      return(
        <View style={styles.container}>
          <View style={styles.userInfoContainer}>
            <View style={{width: '100%'}}>
              { currentUser !== userDetails.id ?
                <Button
                  title={userDetails.isFollowing ? 'Unfollow' : 'Follow'}
                  buttonStyle={styles.mainBtn}
                  onPress={this.toggleFollowing}
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
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 15}}>
            <Text style={styles.textContent}>Followers {userDetails.followers}</Text>
            <Text style={styles.textContent}>Following {userDetails.following}</Text>
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
    paddingTop: Constants.statusBarHeight,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  rightIcon: {
    marginRight: 15
  },
  userInfoContainer: {
    height: '30%',
    width: '100%',
    flexDirection: 'column',
  },
  textContent: {
    color: PRIMARY_LIGHT_COLOR,
    fontSize: 16
  },
  mainBtn: {
    backgroundColor: PRIMARY_DARK_COLOR,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 15,
    borderWidth: 1,
    borderColor: ACCENT_COLOR
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
