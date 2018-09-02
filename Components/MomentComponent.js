import React from 'react';
import { View,
         StyleSheet,
         TouchableHighlight,
         Image } from 'react-native';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { ListItem, Avatar } from 'react-native-elements';

export default class MomentComponent extends React.Component {
  render() {
    const { moment, navigation, height } = this.props;

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

        <TouchableHighlight
          underlayColor="#eee"
          style={[styles.imageTouch, { height }]}
          onPress={() => navigation.push('EventDetails', { eventId: moment.id })}
        >
          <Image style={styles.image} resizeMode='cover' source={{uri: moment.image}} />
        </TouchableHighlight>
        {/* <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.imageTopOverlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Icon color={PRIMARY_DARK_COLOR} name='visibility' size={15} />
              <Text style={{ color: '#000', marginLeft: 5, fontSize: 12 }}>{moment.view_count}</Text>
              { moment.recent_views &&
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                  <Icon color='green' name='arrow-upward' size={15} />
                  <Text style={{ color: '#000', marginLeft: 5, fontSize: 12 }}>{moment.recent_views}</Text>
                </View>
              }
            </View>
            { moment.privacy === 'Private' &&
              <Icon color='red' name='lock' size={15} />
            }
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{moment.title}</Text>
          </View>
        </View> */}
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
