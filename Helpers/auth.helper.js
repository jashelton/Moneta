import { AsyncStorage } from "react-native";

export const authHelper = {
  authHeaders,
  getParsedUserData,
  getCurrentUserId
};

async function authHeaders() {
  let data = await AsyncStorage.getItem("user_data");
  data = JSON.parse(data);
  return { headers: { Authorization: `JWT ${data.jwt}` } };
}

async function getParsedUserData() {
  let data = await AsyncStorage.getItem("user_data");
  data = JSON.parse(data);
  return data;
}

async function getCurrentUserId() {
  let data = await AsyncStorage.getItem("user_data");
  data = JSON.parse(data);
  return data.id;
}
