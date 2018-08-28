import React from 'react';
import MapView from 'react-native-maps';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { commonHelper, LocationHelper, authHelper } from '../Helpers';
import { PRIMARY_DARK_COLOR, PRIMARY_COLOR, DIVIDER_COLOR } from '../common/styles/common-styles';
import FilterEventsModal from '../Components/FilterEventsModal';
import { getEventMarkers } from '../reducer';

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
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name='refresh'
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam('refreshEventMarkers')}
        />
      )
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      filtersVisible: false,
      socialSelected: 'All',
      refreshing: false,
      currentUser: null,
      appState: AppState.currentState,
      region: null
    }

    this.updateSocialSelected = this.updateSocialSelected.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    this.setCurrentLocation = this.setCurrentLocation.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.setCurrentLocation();
    const currentUser = await authHelper.getCurrentUserId();
    this.setState({ currentUser });

    this.getEvents(this.state.socialSelected);

    // commonHelper.getFilters()
    //   .then(res => {
    //     this.setState({socialSelected: res.eventsFor});
    //   })
    //   .then(() => {
    //     this.getEvents(this.state.socialSelected);
    //   })
    //   .catch(err => console.log(err)),

    this.props.navigation.setParams({
      toggleIsVisible: () => this.toggleIsVisible(),
      showFilterList: () => this.setState({filtersVisible: !this.state.filtersVisible}),
      refreshEventMarkers: () => this._onRefresh()
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.getEvents(this.state.socialSelected);
    }
    this.setState({appState: nextAppState});
  }

  async setCurrentLocation() {
    const { coords } = await LocationHelper.getCurrentLocation();
    const region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    };

    this.setState({ region });
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.getEvents(this.state.socialSelected);
    this.setState({ refreshing: false });
  }

  updateSocialSelected(option) {
    this.setState({socialSelected: option});
    this.getEvents(option);
  }

  getEvents(selectedOption) {
    this.props.getEventMarkers(selectedOption);
  }

  toggleIsVisible() {
    this.setState({isVisible: !this.state.isVisible});
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  render() {
    const { filtersVisible, socialSelected, refreshing, currentUser, region } = this.state;
    const { markers, loading } = this.props;

    return (
      <View style={styles.container}>
        <FilterEventsModal
          filtersVisible={filtersVisible}
          setVisibility={() => this.setState({filtersVisible: !this.state.filtersVisible})}
          socialSelected={socialSelected}
          updateSocialSelected={(option) => this.updateSocialSelected(option)}
        />
        { !loading && !refreshing ?
          <View style={styles.container}>
            { region &&
              <View style={styles.container}>
                <MapView
                  style={{ flex: 1 }}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  showsIndoors={true}
                  loadingEnabled={true}
                  showsTraffic={false}
                  mapType="standard"
                  region={region}
                  onRegionChangeComplete={this.onRegionChange}
                >
                  { markers.length && markers.map((m, i) => (
                    <MapView.Marker
                      key={i}
                      pinColor={m.user_id === currentUser ? PRIMARY_COLOR : m.viewed_id !== null ? DIVIDER_COLOR : 'red'}
                      onPress={() => this.props.navigation.navigate('EventDetails', { eventId: m.id })}
                      ref={marker => { this.marker = marker }}
                      coordinate={m.coordinate}
                    />
                  ))
                  }
                </MapView>
                <View style={{ position: 'absolute', bottom: 25, right: 25 }}>
                  <Icon
                    raised
                    size={30}
                    color={PRIMARY_DARK_COLOR}
                    name='my-location'
                    onPress={this.setCurrentLocation}
                  />
                </View>
              </View>
            }
          </View>
        :
          <View>
            <ActivityIndicator />
          </View>
        }
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
  rightIcon: {
    marginRight: 10
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
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);
