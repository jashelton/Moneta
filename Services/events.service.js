import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  getEventDetails,
  createEvent,
  deleteEvent,
  getRecentEventsById,
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

async function deleteEvent(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/events/${eventId}/delete`, null, headers)
}

async function getRecentEventsById(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/recent_events/${eventId}`, headers);
}
