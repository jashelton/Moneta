import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const userService = {
  getUserDetails,
  updateUserDetails
}

async function getUserDetails(userId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/user-details/${userId}`, headers);
}

async function updateUserDetails(user) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/${user.id}/update`, { user }, headers)
}
