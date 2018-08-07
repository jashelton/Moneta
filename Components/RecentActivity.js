import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, TouchableHighlight, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { LocationHelper } from '../Helpers';
import { getEventDetails } from '../reducer';

class RecentActivity extends React.Component {

  async setEventDetails(eventId) {
    const { navigation } = this.props;
    const currentLocation = await LocationHelper.getCurrentLocation();

    this.props.getEventDetails(eventId, currentLocation);
    navigation.navigate('EventDetails')
  }

  render() {
    const { recentEvents } = this.props;

    return(
      <ScrollView>
        <View style={styles.imagesContainer}>
          { recentEvents.map((event, i) => (
            <TouchableHighlight
              key={i}
              underlayColor="#eee"
              style={styles.imageTouch}
              onPress={() => this.setEventDetails(event.id)}
            >
              <ImageBackground style={styles.image} source={{uri: event.image}}>
                <View style={styles.imageOverlay}>
                  <Text style={{color:'#fff'}}>{event.name}</Text>
                </View>
              </ImageBackground>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    );
  }
}

RecentActivity.propTypes = {
  recentEvents: PropTypes.array.isRequired
}

const styles = StyleSheet.create({
  imagesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageTouch: {
    width: '50%',
    height: Dimensions.get('window').height / 4,
    borderWidth: 2,
    borderColor: PRIMARY_DARK_COLOR,
  },
  image: {
    flex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const mapStateToProps = state => {
  return {
    recentEvents: state.recentEvents,
    loading: state.loading
  };
};

const mapDispatchToProps = {
  getEventDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(RecentActivity);