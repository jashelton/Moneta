import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const eventsService = {
  createEvent,
}

async function createEvent(event) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/events/create`, event, headers);
}
