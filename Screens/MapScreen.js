import React from "react";
import { Query } from "react-apollo";
import { MAP_MARKERS } from "../graphql/queries";
import MapView from "react-native-maps";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Icon } from "react-native-elements";
import { LocationHelper, authHelper } from "../Helpers";
import {
  PRIMARY_DARK_COLOR,
  PRIMARY_COLOR,
  DIVIDER_COLOR
} from "../common/styles/common-styles";

export default class MapScreen extends React.Component {
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
      region: null
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

  render() {
    const { currentUser, region } = this.state;

    return (
      <View style={styles.container}>
        <Query query={MAP_MARKERS} variables={{ type: "moment" }}>
          {({ loading, error, data, refetch }) => {
            const markers = data.allEvents;

            if (loading)
              return (
                <View>
                  <ActivityIndicator />
                </View>
              );

            return (
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
                            pinColor={
                              m.user_id === currentUser
                                ? PRIMARY_COLOR
                                : m.viewed_id !== null
                                  ? DIVIDER_COLOR
                                  : "red"
                            }
                            onPress={() =>
                              this.props.navigation.navigate("EventDetails", {
                                eventId: m.id
                              })
                            }
                            ref={marker => {
                              this.marker = marker;
                            }}
                            coordinate={m.coordinate}
                          />
                        ))}
                    </MapView>
                    <View
                      style={{ position: "absolute", bottom: 25, right: 25 }}
                    >
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
            );
          }}
        </Query>
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
