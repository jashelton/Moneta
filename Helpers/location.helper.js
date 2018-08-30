import { Location, Permissions } from 'expo';

export const LocationHelper = {
  getCurrentLocation,
  coordsToAddress,
  formatExifCoords
}

async function getCurrentLocation() {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') return null;

  const currentLocation = await Location.getCurrentPositionAsync({});
  return currentLocation;
};

async function coordsToAddress(coords) {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') return null;

  const address = await Location.reverseGeocodeAsync(coords);
  return address;
}

function formatExifCoords(exif) {
  const latitude = exif.GPSLatitudeRef === 'N' ? exif.GPSLatitude : parseFloat(`-${exif.GPSLatitude}`);
  const longitude = exif.GPSLongitudeRef === 'N' ? exif.GPSLongitude : parseFloat(`-${exif.GPSLongitude}`);

  return { latitude, longitude };
}
