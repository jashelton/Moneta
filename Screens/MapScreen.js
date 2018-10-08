import React from "react";
import { graphql } from "react-apollo";
import { MAP_MARKERS } from "../graphql/queries";
import MapView from "react-native-maps";
import { View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import {
  LocationHelper,
  authHelper,
  PublisherBannerComponent
} from "../Helpers";
import { WaveIndicator } from "react-native-indicators";
import {
  PRIMARY_DARK_COLOR,
  PRIMARY_COLOR
} from "../common/styles/common-styles";
import ErrorComponent from "../Components/ErrorComponent";

class MapScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Event Map",
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="refresh"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam("refreshEventMarkers")}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      currentUser: null,
      region: null,
      bannerError: false
    };

    this.onRegionChange = this.onRegionChange.bind(this);
    this.setCurrentLocation = this.setCurrentLocation.bind(this);
  }

  async componentDidMount() {
    this.setCurrentLocation();
    const currentUser = await authHelper.getCurrentUserId();
    this.setState({ currentUser });

    this.props.navigation.setParams({
      refreshEventMarkers: () => this._onRefresh()
    });
  }

  async setCurrentLocation() {
    const region = {
      latitudeDelta: 0.1922,
      longitudeDelta: 0.1421
    };
    const currentLocation = await LocationHelper.getCurrentLocation();

    region.latitude = currentLocation ? currentLocation.coords.latitude : 39.5;
    region.longitude = currentLocation
      ? currentLocation.coords.longitude
      : -98.35;
    this.setState({ region });
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  _onRefresh = () => {
    this.props.data.refetch();
  };

  render() {
    const { currentUser, region } = this.state;
    const { loading, error, allEvents: markers, refetch } = this.props.data;

    if (loading)
      return (
        <View>
          <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
        </View>
      );

    if (error)
      return (
        <ErrorComponent
          iconName="error"
          refetchData={refetch}
          errorMessage={error.message}
          isSnackBarVisible={error ? true : false}
          snackBarActionText="Retry"
        />
      );

    return (
      <View
        style={[
          styles.container,
          !this.state.bannerError ? { paddingBottom: 50 } : null
        ]}
      >
        <View style={styles.container}>
          {region && (
            <View style={styles.container}>
              <MapView
                style={styles.map}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsIndoors={true}
                loadingEnabled={true}
                showsTraffic={false}
                mapType="standard"
                region={region}
                onRegionChangeComplete={this.onRegionChange}
              >
                {markers.length &&
                  markers.map((m, i) => (
                    <MapView.Marker
                      key={i}
                      flat={true}
                      pinColor={
                        m.user.id === currentUser ? PRIMARY_COLOR : "red"
                      }
                      onPress={() =>
                        this.props.navigation.navigate("EventDetails", {
                          eventId: m.id,
                          userId: m.user.id
                        })
                      }
                      ref={marker => {
                        this.marker = marker;
                      }}
                      coordinate={m.coordinate}
                    />
                  ))}
              </MapView>
              <View style={{ position: "absolute", bottom: 25, right: 25 }}>
                <Icon
                  raised
                  size={30}
                  color={PRIMARY_DARK_COLOR}
                  name="my-location"
                  onPress={this.setCurrentLocation}
                />
              </View>
            </View>
          )}
        </View>
        <PublisherBannerComponent
          bannerError={() => this.setState({ bannerError: true })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  leftIcon: {
    marginLeft: 10
  },
  rightIcon: {
    marginRight: 10
  },
  eventPrivacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export default graphql(MAP_MARKERS, {
  options: {
    variables: { type: "moment", map: true }
  }
})(MapScreen);
