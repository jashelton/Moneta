import React from 'react';
import { View,
         ScrollView,
         Text,
         StyleSheet,
         Dimensions,
         TouchableHighlight,
         ImageBackground,
         RefreshControl,
         FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { LocationHelper } from '../Helpers';
import { getEventDetails } from '../reducer';

class RecentActivity extends React.Component {

  async goToEventsDetails(eventId) {
    const { navigation } = this.props;
    const currentLocation = await LocationHelper.getCurrentLocation();

    this.props.getEventDetails(eventId, currentLocation);
    navigation.navigate('EventDetails')
  }

  _renderImage({item, index}) {
    return(
      <TouchableHighlight
        underlayColor="#eee"
        style={styles.imageTouch}
        onPress={() => this.goToEventsDetails(item.id)}
      >
        <ImageBackground style={styles.image} resizeMode='cover' source={{uri: item.image}}>
          <View style={styles.imageOverlay}>
            <Text style={{color:'#fff'}}>{item.name}</Text>
          </View>
        </ImageBackground>
      </TouchableHighlight>
    );
  }

  render() {
    const { events, noDataMessage, refreshing } = this.props;

    if (events && events.length) {
      return(
        <View style={styles.imagesContainer}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            data={events}
            renderItem={this._renderImage.bind(this)}
            onEndReached={ () => this.props.handleScroll(events.length)}
            onEndReachedThreshold={0}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.props._onRefresh}
              />
            }
          />
        </View>
      );
    } else {
      return(
        <ScrollView
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.props._onRefresh}
            />
          }
        >
          <Text>{ noDataMessage || 'No recent activity to display' }</Text>
        </ScrollView>
      )
    }
  }
}

RecentActivity.propTypes = {
  events: PropTypes.array.isRequired,
  refreshing: PropTypes.bool.isRequired,
  _onRefresh: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  imagesContainer: {
    paddingTop: 5
  },
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