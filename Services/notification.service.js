import axios from "axios";
import { ENDPOINT } from "react-native-dotenv";
import { authHelper } from "../Helpers";

export const notificationService = {
  insertPushToken,
  sendPushNotification,
  createNotification
};

async function insertPushToken(token) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/push-token`, { token }, headers);
}

async function sendPushNotification(userId, title, body) {
  const headers = await authHelper.authHeaders();
  const { data } = await axios.get(
    `${ENDPOINT}/users/${userId}/push-token`,
    headers
  );
  if (data.push_token) {
    const notifyData = { to: data.push_token, title, body };
    const options = {
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "accept-encoding": "gzip, deflate"
      }
    };

    const push = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      notifyData,
      options
    );
    return push;
  }

  return;
}

async function createNotification(eventId, userId, type) {
  const headers = await authHelper.authHeaders();
  const data = { eventId, userId, type };
  return axios.post(`${ENDPOINT}/users/:id/notifications`, data, headers);
}
