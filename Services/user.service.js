import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const userService = {
  getUserDetails
}

async function getUserDetails(userId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/user-details/${userId}`, headers);
}