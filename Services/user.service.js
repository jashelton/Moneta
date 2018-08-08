import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from '../Helpers';

export const userService = {
  getUserDetails,
  toggleFollowing,
  updateUserDetails
}

async function getUserDetails(userId) {
  const headers = await authHelper.authHeaders();
  return axios.get(`${ENDPOINT}/user-details/${userId}`, headers);
}

async function toggleFollowing(userId, followState) {
  return await followState ? followUser(userId) : unfollowUser(userId);
}

async function followUser(userId) {
  const headers = await authHelper.authHeaders();
  return axios.post(`${ENDPOINT}/follows/${userId}/follow`, null, headers);
}

async function unfollowUser(userId) {
  const headers = await authHelper.authHeaders();
  return axios.delete(`${ENDPOINT}/follows/${userId}/unfollow`, headers);
}

async function updateUserDetails(user) {
  const headers = await authHelper.authHeaders();
  return axios.put(`${ENDPOINT}/users/${user.id}/update`, { user }, headers)
}
