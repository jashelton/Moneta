import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  getEvents,
  createEvent
}

async function getEvents() {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/events`, headers);
}

async function createEvent(event) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/events/create`, event, headers);
}