import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  createEvent,
  getRecentEventsById,
}

async function createEvent(event) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/events/create`, event, headers);
}

async function getRecentEventsById(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/recent_events/${eventId}`, headers);
}
