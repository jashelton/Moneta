import React from 'react';
import Nav from './Navigation/Navigator';
import { createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import { ENDPOINT } from 'react-native-dotenv';
import { local_env } from './environment.js';
import { authHelper } from './Helpers';

import reducer from './reducer';

const client = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? local_env.production.ENDPOINT : local_env.development.ENDPOINT,
  responseType: 'json',
});

// Interceptor to set headers for all requests to API
client.interceptors.request.use(
  async config => {
    const { headers } = await authHelper.authHeaders();
    if (headers.Authorization && config.baseURL === ENDPOINT) {
      config.headers.authorization = headers.Authorization;
    }

    return config;
  }
)

const store = createStore(reducer, applyMiddleware(axiosMiddleware(client)));

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Nav />
      </Provider>
    );
  }
}
