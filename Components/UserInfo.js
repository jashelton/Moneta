import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Button } from 'react-native-elements';

import { PRIMARY_DARK_COLOR, TEXT_ICONS_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';

export default class UserInfo extends React.Component {
  _getInitials() {
    const { userDetails } = this.props;
    if (userDetails.name) {
      return userDetails.name.split(' ').map((n,i,a)=> i === 0 || i+1 === a.length ? n[0] : null).join('');
    }
  }

  render() {
    const { userDetails, currentUser, toggleEditProfile, toggleFollowing } = this.props;
    return(
      <View style={[styles.userInfoContainer, { backgroundColor: PRIMARY_DARK_COLOR }]}>
        <View style={{width: '100%'}}>
          { currentUser !== userDetails.id ?
            <Button
              title={userDetails.isFollowing ? 'Unfollow' : 'Follow'}
              buttonStyle={styles.mainBtn}
              titleStyle={{ color: TEXT_ICONS_COLOR }}
              onPress={toggleFollowing}
            />
            :
            <Button
              title='Edit Profile'
              buttonStyle={styles.mainBtn}
              onPress={toggleEditProfile}
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
    );
  }
}

const styles = StyleSheet.create({
  userInfoContainer: {
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
});
