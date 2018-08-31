import { Location, Permissions } from 'expo';

export const LocationHelper = {
  getCurrentLocation,
  coordsToAddress,
  formatExifCoords,
  generateRandomPoint
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

/**
* Generates number of random geolocation points given a center and a radius.
* Reference URL: http://goo.gl/KWcPE.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @return {Object} The generated random points as JS object with lat and lng attributes.
*/
function generateRandomPoint(center, radius) {
  var x0 = center.longitude;
  var y0 = center.latitude;
  // Convert Radius from meters to degrees.
  var rd = radius/111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x/Math.cos(y0);

  // Resulting point.
  return {'latitude': y+y0, 'longitude': xp+x0};
}
