import axios from "axios";
import { client } from "../App";
import { CREATE_USER, FACEBOOK_USER } from '../graphql/queries';

export const authService = {
  fbLogin,
  fbUserData,
  createUser,
  handleUser,
  getFacebookUser
};

async function fbLogin(token) {
  const userLogin = await axios.get(
    `https://graph.facebook.com/me?access_token=${token}`
  );
  const { data } = await this.handleUser(userLogin.data, token);
  data.facebookUser.facebook_token = token;

  return data.facebookUser;
}

// Get Facebook data
// Check if user exists in DB, if not, create user
async function handleUser(userData, userToken) {
  const { data } = await this.getFacebookUser(userData.id); // name, facebook_id

  if (!data.facebookUser) {
    const facebookUserData = await this.fbUserData(userData.id, userToken); // fname, lname, email, fbId, picture

    await this.createUser(facebookUserData);
  } else {
    return data.facebookUser;
  }

  return await this.getFacebookUser(userData.id);
}

function getFacebookUser(fbId) {
  return client.query({ query: FACEBOOK_USER, variables: { fbId }, fetchPolicy: 'no-cache' });
}

async function createUser(user) {
  await client.mutate({ mutation: CREATE_USER, variables: user });
}

// Get Facebook user data
async function fbUserData(id, token) {
  const { data } = await axios.get(
    `https://graph.facebook.com/${id}?fields=id,first_name,last_name&access_token=${token}`
  );

  return data;
}
