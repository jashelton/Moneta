import React from 'react';
import { View,
         Text,
         StyleSheet,
         TouchableHighlight,
         Image } from 'react-native';
import { DIVIDER_COLOR, PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { Icon } from 'react-native-elements';

export default class MomentComponent extends React.Component {
  render() {
    const { moment, navigation, height } = this.props;
    return(
      <View style={{ flex: 1, flexDirection: 'row', margin: 5, backgroundColor: '#fff' }}>
        <TouchableHighlight
          underlayColor="#eee"
          style={[styles.imageTouch, { height }]}
          onPress={() => navigation.push('EventDetails', { eventId: moment.id })}
        >
          <Image style={styles.image} resizeMode='cover' source={{uri: moment.image}} />
        </TouchableHighlight>
        <View style={{ flex: 1, flexDirection: 'column' }}>
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
          <View style={styles.imageOverlay}>
            <Text style={{color:DIVIDER_COLOR}}>{moment.username || moment.name}</Text>
            <Text style={{color:DIVIDER_COLOR, fontSize: 10}}>{moment.city ? `${moment.city},` : null} {moment.region}, {moment.country_code}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageTouch: {
    width: '50%',
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
  }
});
