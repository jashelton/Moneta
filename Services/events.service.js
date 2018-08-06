import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  getEventMarkers,
  getEventDetails,
  createEvent,
  // likeEvent,
  deleteEvent,
  getRecentEventsById,
  getRecentEvents
}

async function getEventMarkers(filter) {
  const { headers } = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/event_markers`, {
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

// async function likeEvent(eventId, liked) {
//   const headers = await authHelper.authHeaders();
//   return axios.post(`${ENDPOINT}/events/${eventId}/like`, { liked: liked ? 1 : 0 }, headers)
// }

async function deleteEvent(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/events/${eventId}/delete`, null, headers)
}

async function getRecentEventsById(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/recent_events/${eventId}`, headers);
}

async function getRecentEvents(users, coords) {
  const { headers } = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/recent_events`, {
    params: {
      users,
      coords
    },
    headers
  })  
}
