import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Button, ListItem } from 'react-native-elements';

import { PRIMARY_DARK_COLOR, TEXT_ICONS_COLOR, ACCENT_COLOR, LIGHT_PRIMARY_COLOR } from '../common/styles/common-styles';

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
        <View style={{width: '100%', flex: 1, flexDirection: 'column'}}>
          <ListItem
            containerStyle={{ backgroundColor: PRIMARY_DARK_COLOR }}
            title={userDetails.name}
            titleStyle={{color: TEXT_ICONS_COLOR}}
            subtitle={`Joined: ${new Date(userDetails.created_at).toISOString().substring(0, 10)}`}
            subtitleStyle={{color: LIGHT_PRIMARY_COLOR, fontSize: 12, fontWeight: '200'}}
            rightElement={ currentUser !== userDetails.id ?
              <Button
                title={userDetails.isFollowing ? 'Unfollow' : 'Follow'}
                buttonStyle={styles.mainBtn}
                titleStyle={{ color: TEXT_ICONS_COLOR, fontWeight: '200' }}
                onPress={toggleFollowing}
              />
              :
              <Button
                title='Edit Profile'
                buttonStyle={styles.mainBtn}
                onPress={toggleEditProfile}
                titleStyle={{ color: TEXT_ICONS_COLOR, fontWeight: '200' }}
              />
            }
          />
          <Avatar
            size={100}
            rounded
            source={userDetails.profile_image ? {uri: userDetails.profile_image} : null}
            title={!userDetails.profile_image ? this._getInitials() : null}
            activeOpacity={0.7}
            containerStyle={{ alignSelf: 'center', paddingVertical: 10 }}
          />
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end'}}>
          <View style={styles.textWrapper}>
            <Text style={styles.socialNumber}>{userDetails.followers}</Text>
            <Text style={styles.socialText}>FOLLOWERS</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.socialNumber}>{userDetails.following}</Text>
            <Text style={styles.socialText}>FOLLOWING</Text>
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.socialNumber}>1</Text>
            <Text style={styles.socialText}>MUTUAL</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#eee',
    paddingTop: 15,
    justifyContent: 'space-evenly'
  },
  textWrapper: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  socialNumber: {
    color: TEXT_ICONS_COLOR,
    fontSize: 16,
    fontWeight: '200'
  },
  socialText: {
    color: LIGHT_PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: '200'
  },
  mainBtn: {
    backgroundColor: PRIMARY_DARK_COLOR,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
});
