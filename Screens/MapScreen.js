import React from 'react';
import MapView from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import { commonHelper, LocationHelper } from '../Helpers';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import FilterEventsModal from '../Components/FilterEventsModal';
import { getEventMarkers, getEventDetails } from '../reducer';

class MapScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Event Map',
      headerLeft: (
        <Icon
          containerStyle={styles.leftIcon}
          size={28}
          name="filter-list"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam('showFilterList')}
        />
      ),
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      filtersVisible: false,
      socialSelected: 'All',
      coords: { latitude: null, longitude: null }
    }

    this.updateSocialSelected = this.updateSocialSelected.bind(this);
    this.setEventDetails = this.setEventDetails.bind(this);
  }

  async componentDidMount() {
    const { coords } = await LocationHelper.getCurrentLocation();
    this.setState({ coords });

    commonHelper.getFilters()
      .then(res => {
        this.setState({socialSelected: res.eventsFor});
      })
      .then(() => {
        this.getEvents(this.state.socialSelected);
      })
      .catch(err => console.log(err)),

    this.props.navigation.setParams({
      toggleIsVisible: () => this.toggleIsVisible(),
      showFilterList: () => this.setState({filtersVisible: !this.state.filtersVisible})
    });
  }

  updateSocialSelected(option) {
    this.setState({socialSelected: option});
    this.getEvents(option);
  }

  getEvents(selectedOption) {
    this.props.getEventMarkers(selectedOption);
  }

  toggleIsVisible() {
    this.setState({isVisible: true});
  }

  async setEventDetails(eventId) {
    const { navigation } = this.props;
    const currentLocation = await LocationHelper.getCurrentLocation();

    this.props.getEventDetails(eventId, currentLocation);
    navigation.navigate('EventDetails')
  }

  render() {
    const { filtersVisible, socialSelected } = this.state;
    const { markers } = this.props;
    const { latitude, longitude } = this.state.coords;

    return (
      <View style={styles.container}>
        { latitude && longitude &&
          <MapView
            style={{ flex: 1 }}
            showsUserLocation={true}
            showsPointsOfInterest={true}
            mapType="hybrid"
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.0922, // lat and long delta is used to determine how far in/out you want to zoom.
              longitudeDelta: 0.0421,
            }}
          >
            { markers.length && markers.map((m, i) => (
              <MapView.Marker
                key={i}
                onPress={() => this.setEventDetails(m.id)}
                ref={marker => { this.marker = marker }}
                coordinate={m.coordinate}
              />
            ))
            }
          </MapView>
        }
        <FilterEventsModal
          filtersVisible={filtersVisible}
          setVisibility={() => this.setState({filtersVisible: !this.state.filtersVisible})}
          socialSelected={socialSelected}
          updateSocialSelected={(option) => this.updateSocialSelected(option)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftIcon: {
    marginLeft: 10
  },
  eventPrivacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

const mapStateToProps = state => {
  return {
    markers: state.markers,
    loading: state.loading
  };
};

const mapDispatchToProps = {
  getEventMarkers,
  getEventDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
