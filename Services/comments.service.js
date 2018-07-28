import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const commentsService = {
  getComments,
  createComment,
}

async function getComments(eventId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/comments/${eventId}`, headers);
}

async function createComment(eventId, text) {
  const headers = await authHelper.authHeaders();
  return axios.post( `${ENDPOINT}/comments/${eventId}`, { text }, headers);
}
