import React from "react";
import Nav from "./Navigation/Navigator";
import { SENTRY_DNS } from "react-native-dotenv";
import { authHelper } from "./Helpers";
import { StatusBar, View } from "react-native";
import Sentry from "sentry-expo";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { ApolloProvider } from "react-apollo";

// Sentry.enableInExpoDevelopment = true;
Sentry.config(SENTRY_DNS).install();

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { withClientState } from "apollo-link-state";
import { ApolloLink, Observable } from "apollo-link";

const cache = new InMemoryCache({});

const request = async operation => {
  const token = await authHelper.getToken();

  operation.setContext({
    headers: {
      authorization: token
    }
  });
};

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

export const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        // TODO: [Look into] Could pass errors through props on wrapper and display snackbar?
        // https://github.com/apollographql/apollo-client/issues/1812
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            ` 
              [GraphQL error]: Message: ${message},
              Location: ${JSON.stringify(locations)},
              Path: ${path}
            `
          )
        );
      }
      if (networkError) {
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }
    }),
    requestLink,
    withClientState({
      defaults: {
        isConnected: true
      },
      resolvers: {
        Mutation: {
          updateNetworkStatus: (_, { isConnected }, { cache }) => {
            cache.writeData({ data: { isConnected } });
            return null;
          }
        }
      },
      cache
    }),
    new HttpLink({
      uri: "http://192.168.0.6:4000"
      // credentials: "include"
    })
  ]),
  cache
});

export default class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <ActionSheetProvider>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle={"dark-content"} />
            <Nav />
          </View>
        </ActionSheetProvider>
      </ApolloProvider>
    );
  }
}
