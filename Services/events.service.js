import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  getEvents,
  getEventDetails,
  createEvent,
  likeEvent,
  deleteEvent,
}

async function getEvents(filter) {
  const { headers } = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/events`, {
    params: {
      filter
    },
    headers
  });
}

async function getEventDetails(eventId, userLocation) {
  const { headers } = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/events/${eventId}/details`, {
    params: {
      userLocation
    },
    headers
  });
}

async function createEvent(event) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/events/create`, event, headers);
}

async function likeEvent(eventId, liked) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/events/${eventId}/like`, { liked: liked ? 1 : 0 }, headers)
}

async function deleteEvent(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/events/${eventId}/delete`, null, headers)
}
