import axios from "axios";
import { ENDPOINT } from "react-native-dotenv";
import { authHelper } from "../Helpers";

export const notificationService = {
  sendPushNotification,
  createNotification
};

async function sendPushNotification(push_token, body) {
  const notifyData = { to: push_token, body, badge: 0 };
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

async function createNotification(eventId, userId, type) {
  const headers = await authHelper.authHeaders();
  const data = { eventId, userId, type };
  return axios.post(`${ENDPOINT}/users/:id/notifications`, data, headers);
}
