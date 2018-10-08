import { AsyncStorage } from "react-native";
import { ImagePicker, Permissions } from "expo";
import { filters } from "../common/defaults/filters";

export const commonHelper = {
  getFilters,
  setFilters,
  selectImage,
  getRateLimitFilter
};

async function getFilters() {
  let data = await AsyncStorage.getItem("user_filters");

  if (!data) {
    await setFilters(filters);
  }

  data = await AsyncStorage.getItem("user_filters");
  return JSON.parse(data);
}

async function setFilters(filters) {
  await AsyncStorage.setItem("user_filters", JSON.stringify(filters));
}

async function getRateLimitFilter() {
  let data = await getFilters();
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
