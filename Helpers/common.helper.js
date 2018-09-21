import { AsyncStorage } from "react-native";
import { ImagePicker, Permissions } from "expo";

export const commonHelper = {
  getFilters,
  selectImage
};

async function getFilters() {
  let data = await AsyncStorage.getItem("user_filters");
  data = JSON.parse(data);
  return data;
}

async function setFilters() {}

async function selectImage(withExif) {
  let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

  if (status !== "granted") {
    this.setState({
      errorMessage: "Permission to access camera roll was denied"
    });
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    // Require type image
    allowsEditing: false,
    aspect: [4, 3],
    exif: withExif
  });

  return result;
}
