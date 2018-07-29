import { Location, Permissions } from 'expo';

export const LocationHelper = {
  getCurrentLocation,
}

async function getCurrentLocation() {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    this.setState({
      errorMessage: 'Permission to access location was denied',
    });
  }

  const currentLocation = await Location.getCurrentPositionAsync({});
  return currentLocation;
};
