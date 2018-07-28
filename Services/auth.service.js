import axios from 'axios';
import { ENDPOINT } from 'react-native-dotenv';

export const authService = {
  fbLogin,
  fbUserData,
  getUser,
  createUser,
  handleUser
};

async function fbLogin(token) {
  const userLogin = await axios.get(`https://graph.facebook.com/me?access_token=${token}`);
  const { user } = await this.handleUser(userLogin.data, token);
  user.facebook_token = token;

  return user;
}

// Get Facebook data
// Check if user exists in DB, if not, create user
async function handleUser(userData, userToken) {
  const facebookUser = await this.getUser(userData.id); // name, facebook_id
  const facebookUserData = await this.fbUserData(userData.id, userToken); // fname, lname, email, fbId, picture
  
  if (!facebookUser.user) {
    await this.createUser(facebookUserData);
  } else {
    // User already exists
    // TODO: Check if data has changed
    return facebookUser;
  }

  return await this.getUser(userData.id);
}

// Get user from database
async function getUser(user_id) {
  const { data } = await axios.get(`${ENDPOINT}/users/${user_id}`);
  return data;
}

async function createUser(user) {
  await axios.post(`${ENDPOINT}/users/create`, user);
}

// Get Facebook user data
async function fbUserData(id, token) {
  const { data } = await axios.get(`https://graph.facebook.com/${id}?fields=id,first_name,last_name&access_token=${token}`);
  return data;
}