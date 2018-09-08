import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Dimensions } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import TimeAgo from 'react-native-timeago';
import { PRIMARY_DARK_COLOR, TEXT_ICONS_COLOR, ACCENT_COLOR, LIGHT_PRIMARY_COLOR } from '../common/styles/common-styles';

export default class UserInfo extends React.Component {
  _getInitials() {
    const { userDetails } = this.props;
    if (userDetails.name) {
      return userDetails.name.split(' ').map((n,i,a)=> i === 0 || i+1 === a.length ? n[0] : null).join('');
    }
  }

  render() {
    const { userDetails, currentUser, toggleEditProfile, toggleFollowing, toggleFollowsModal } = this.props;
    return(
      <View style={ styles.userInfoContainer }>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', padding: 5}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Avatar
              size={Dimensions.get('window').height < 600 ? 100 : 150}
              rounded
              source={userDetails.profile_image ? {uri: userDetails.profile_image} : null}
              title={!userDetails.profile_image ? this._getInitials() : null}
              activeOpacity={0.7}
            />
          </View>
          <View style={{flex: 1, justifyContent: 'space-evenly', alignItems: 'center'}}>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 18, color: '#fff', fontWeight: '200'}}>{userDetails.name}</Text>
              <Text style={{color: LIGHT_PRIMARY_COLOR, fontSize: 12, fontWeight: '200'}}>
                {<TimeAgo time={userDetails.created_at} style={styles.subText}/>}
              </Text>
            </View>
            { currentUser !== userDetails.id ?
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
          </View>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end'}}>
          <TouchableHighlight onPress={() => toggleFollowsModal('followers')}>
            <Text style={styles.socialText}>{userDetails.followers} Followers</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => toggleFollowsModal('following')}>
            <Text style={styles.socialText}>{userDetails.following} Following</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => toggleFollowsModal('mutual')}>
            <Text style={styles.socialText}>{userDetails.mutual} Mutual</Text>
          </TouchableHighlight>
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
    justifyContent: 'center',
    backgroundColor: PRIMARY_DARK_COLOR
  },
  socialText: {
    color: LIGHT_PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '200'
  },
  mainBtn: {
    backgroundColor: PRIMARY_DARK_COLOR,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
});
