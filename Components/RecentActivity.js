import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, TouchableHighlight, ImageBackground, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PRIMARY_LIGHT_COLOR } from '../common/styles/common-styles';
import { LocationHelper } from '../Helpers';
import { getEventDetails } from '../reducer';

class RecentActivity extends React.Component {

  async goToEventsDetails(eventId) {
    const { navigation } = this.props;
    const currentLocation = await LocationHelper.getCurrentLocation();

    this.props.getEventDetails(eventId, currentLocation);
    navigation.navigate('EventDetails')
  }

  render() {
    const { events, noDataMessage, refreshing } = this.props;

    return(
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={this.props._onRefresh}
          />
        }
      >
        { events.length ?
          <View style={styles.imagesContainer}>
            { events.map((event, i) => (
              <TouchableHighlight
                key={i}
                underlayColor="#eee"
                style={styles.imageTouch}
                onPress={() => this.goToEventsDetails(event.id)}
              >
                <ImageBackground style={styles.image} source={{uri: event.image}}>
                  <View style={styles.imageOverlay}>
                    <Text style={{color:'#fff'}}>{event.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableHighlight>
            ))}
          </View>
        :
          <View style={{alignItems: 'center', padding: 25}}>
            <Text style={{color: PRIMARY_LIGHT_COLOR}}>{noDataMessage}</Text>
          </View>
        }
      </ScrollView>
    );
  }
}

RecentActivity.propTypes = {
  events: PropTypes.array.isRequired
}

const styles = StyleSheet.create({
  imagesContainer: {
    flex: 1,
    flexDirection: 'column', // wrap
    flexWrap: 'wrap',
    paddingTop: 5
  },
  imageTouch: {
    width: '100%', // 50%
    height: Dimensions.get('window').height / 2, // height: Dimensions.get('window').height / 4
    padding: 2
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
    loading: state.loading
  };
};

const mapDispatchToProps = {
  getEventDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(RecentActivity);