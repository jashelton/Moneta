import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const notificationService = {
  insertPushToken,
  sendPushNotification
};

async function insertPushToken(token) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/push-token`, { token }, headers);
}

async function sendPushNotification(title, body) {
  const headers = await authHelper.authHeaders();
  const { data } = await axios.get(`${ENDPOINT}/users/push-token`, headers);
  const notifyData = { to: data.push_token, title, body };
  const options = {
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'accept-encoding': 'gzip, deflate'
    }
  };

  return await axios.post('https://exp.host/--/api/v2/push/send', notifyData, options);
}