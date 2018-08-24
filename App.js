import React from 'react';
import Nav from './Navigation/Navigator';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';
import { ENDPOINT } from 'react-native-dotenv';
import { authHelper } from './Helpers';

import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import reducer from './reducer';
import { ApolloProvider } from 'react-apollo';

const client = axios.create({
  baseURL: ENDPOINT,
  responseType: 'json',
});

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://192.168.0.6:4466' }),
  cache: new InMemoryCache()
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
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>
          <Nav />
        </Provider>
      </ApolloProvider>
    );
  }
}

