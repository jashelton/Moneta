import axios from "axios";
import { ENDPOINT } from "react-native-dotenv";

import { client } from "../App";
import gql from "graphql-tag";

export const authService = {
  fbLogin,
  fbUserData,
  getUser,
  createUser,
  handleUser,
  user
};

function user(fbId) {
  return client.query({
    query: gql`
      {
        facebookUser(id: ${fbId}) {
          id
          first_name
          last_name
          jwt
        }
      }
    `
  });
}

async function fbLogin(token) {
  const userLogin = await axios.get(
    `https://graph.facebook.com/me?access_token=${token}`
  );
  const { facebookUser } = await this.handleUser(userLogin.data, token);
  facebookUser.facebook_token = token;

  return facebookUser;
}

// Get Facebook data
// Check if user exists in DB, if not, create user
async function handleUser(userData, userToken) {
  const facebookUser = await this.getUser(userData.id); // name, facebook_id

  if (!facebookUser) {
    const facebookUserData = await this.fbUserData(userData.id, userToken); // fname, lname, email, fbId, picture
    await this.createUser(facebookUserData);
  } else {
    // User already exists
    // TODO: Check if data has changed
    return facebookUser;
  }

  return await this.getUser(userData.id);
}

// Get user from database
async function getUser(facebook_id) {
  const { data } = await this.user(facebook_id);
  return data;
}

async function createUser(user) {
  await axios.post(`${ENDPOINT}/users/create`, user);
}

// Get Facebook user data
async function fbUserData(id, token) {
  const { data } = await axios.get(
    `https://graph.facebook.com/${id}?fields=id,first_name,last_name&access_token=${token}`
  );
  return data;
}
