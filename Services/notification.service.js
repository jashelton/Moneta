import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const notificationService = {
  insertPushToken,
  sendPushNotification,
  createNotification,
  getNotifications,
  deleteNotification,
  markNotificationsViewed
};

async function insertPushToken(token) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/push-token`, { token }, headers);
}

async function sendPushNotification(userId, title, body) {
  const headers = await authHelper.authHeaders();
  const { data } = await axios.get(`${ENDPOINT}/users/${userId}/push-token`, headers);
  if (data.push_token) {
    const notifyData = { to: data.push_token, title, body };
    const options = {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'accept-encoding': 'gzip, deflate'
      }
    };

    const push = await axios.post('https://exp.host/--/api/v2/push/send', notifyData, options);
    console.log(push);
    return push;
  }

  return;
}

async function createNotification(eventId, userId, type) {
  const headers = await authHelper.authHeaders();
  const data = { eventId, userId, type };
  return axios.post(`${ENDPOINT}/users/:id/notifications`, data, headers);
}

async function deleteNotification(eventId, userId, type) {
  const { headers } = await authHelper.authHeaders();
  const data = { eventId, userId, type };
  return axios.delete(`${ENDPOINT}/users/:id/notifications`, {
    params: {
      data,
    },
    headers
  });
}

async function getNotifications(offset) {
  const { headers } = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/users/:id/notifications`, {
    params: {
      offset
    },
    headers
  });
}

async function markNotificationsViewed(notificationIds) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/:id/notifications/viewed`, { notificationIds }, headers);
}
