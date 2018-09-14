import React from "react";
import Nav from "./Navigation/Navigator";
import { ENDPOINT, SENTRY_DNS } from "react-native-dotenv";
import { authHelper } from "./Helpers";
import { StatusBar, View } from "react-native";
import Sentry from "sentry-expo";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

// Apollo
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
// Sentry.enableInExpoDevelopment = true;
Sentry.config(SENTRY_DNS).install();

export const client = new ApolloClient({
  uri: "http://192.168.0.6:3000/graphql"
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
