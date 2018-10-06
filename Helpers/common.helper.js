import { AsyncStorage } from "react-native";
import { ImagePicker, Permissions } from "expo";

export const commonHelper = {
  getFilters,
  setFilters,
  selectImage,
  getRateLimitFilter
};

async function getFilters() {
  let data = await AsyncStorage.getItem("user_filters");
  data = JSON.parse(data);
  return data;
}

async function setFilters(filters) {
  AsyncStorage.setItem("user_filters", JSON.stringify(filters));
}

async function getRateLimitFilter() {
  const data = await getFilters();
  return data.events.rateLimit;
}

async function selectImage(withExif) {
  let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

  if (status !== "granted") {
    return { errorMessage: "Permission to access camera roll was denied" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
    exif: withExif
  });

  return result;
}
