import React from 'react';
import { View,
         Text,
         StyleSheet,
         TouchableHighlight,
         Image } from 'react-native';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { ListItem, Avatar } from 'react-native-elements';
import SocialComponent from './SocialComponent';

export default class MomentComponent extends React.Component {
  render() {
    const { moment, navigation, height, handleLike } = this.props;

    return(
      <View style={{ flex: 1, flexDirection: 'column', margin: 5, backgroundColor: '#fff' }}>
        <ListItem
          leftAvatar={
            <Avatar
              size="small"
              rounded
              source={moment.profile_image ? {uri: moment.profile_image} : null}
              icon={{name: 'person', size: 20}}
              activeOpacity={0.7}
            />
          }
          title={moment.name}
          titleStyle={{ color: PRIMARY_DARK_COLOR}}
          subtitle={new Date(moment.created_at).toISOString().substring(0, 10)}
          subtitleStyle={styles.subText}
          chevron
          onPress={() => navigation.navigate('UserDetails', {userId: moment.user_id})}
        />

        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '400', marginBottom: 5 }}>{moment.title}</Text>
          <Text style={{ fontSize: 14, fontWeight: '200' }}>{moment.description}</Text>
        </View>

        <TouchableHighlight
          underlayColor="#eee"
          style={[styles.imageTouch, { height }]}
          onPress={() => navigation.push('EventDetails', { eventId: moment.id })}
        >
          <Image style={styles.image} resizeMode='cover' source={{uri: moment.image}} />
        </TouchableHighlight>
        <SocialComponent
          event={moment}
          navigation={navigation}
          showCommentIcon={true}
          onLikePress={() => handleLike()}
          onCommentPress={() => navigation.navigate('EventDetails', { eventId: moment.id })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageTouch: {
    width: '100%',
    padding: 2
  },
  image: {
    flex: 1,
  },
  imageOverlay: {
    width: '100%',
    padding: 5,
    justifyContent: 'center',
  },
  imageTopOverlay: {
    width: '100%',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subText: {
    fontWeight: '200',
    color: 'grey',
    fontSize: 12
  },
});
