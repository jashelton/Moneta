import React from 'react';
import { View,
         Text,
         StyleSheet,
         Dimensions,
         TouchableHighlight,
         ImageBackground } from 'react-native';
import PropTypes from 'prop-types';
import { DIVIDER_COLOR, PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { Icon } from 'react-native-elements';

export default class MomentComponent extends React.Component {
  render() {
    const { moment, navigation } = this.props;
    return(
      <TouchableHighlight
        underlayColor="#eee"
        style={styles.imageTouch}
        onPress={() => navigation.push('EventDetails', { eventId: moment.id })}
      >
        <ImageBackground style={styles.image} resizeMode='cover' source={{uri: moment.image}}>
          <View style={styles.imageTopOverlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Icon color={PRIMARY_DARK_COLOR} name='visibility' size={15} />
              <Text style={{ color: '#000', marginLeft: 5, fontSize: 12, fontWeight: 'bold' }}>{moment.view_count}</Text>
              { moment.recent_views &&
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                  <Icon color='green' name='arrow-upward' size={15} />
                  <Text style={{ color: '#000', marginLeft: 5, fontSize: 12, fontWeight: 'bold' }}>{moment.recent_views}</Text>
                </View>
              }
            </View>
            { moment.privacy === 'Private' &&
              <Icon color='red' name='lock' size={15} />
            }
          </View>
          <View style={styles.imageOverlay}>
            <Text style={{color:DIVIDER_COLOR}}>{moment.username || moment.name}</Text>
            <Text style={{color:DIVIDER_COLOR, fontSize: 10}}>{moment.city ? `${moment.city},` : null} {moment.region}, {moment.country_code}</Text>
          </View>
        </ImageBackground>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  imageTouch: {
    width: '50%', // 50%
    height: Dimensions.get('window').height / 4, // height: Dimensions.get('window').height / 2
    padding: 2
  },
  image: {
    flex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
