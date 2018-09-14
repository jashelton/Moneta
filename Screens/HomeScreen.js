import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { permissionsHelper } from "../Helpers";
import RecentActivity from "../Components/RecentActivity";
import ErrorComponent from "../Components/ErrorComponent";

const ALL_EVENTS_QUERY = gql`
  query Events($offset: Int!) {
    allEvents(offset: $offset) {
      id
      title
      description
      likes_count
      image
      comments_count
      avg_rating
      event_type
      created_at
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

export default class HomeScreen extends React.Component {
  async componentDidMount() {
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    // await permissionsHelper.registerForPushNotificationsAsync();
  }

  render() {
    return (
      <Query
        query={ALL_EVENTS_QUERY}
        variables={{ offset: 0 }}
        errorPolicy="all"
      >
        {({ loading, error, data, refetch, fetchMore }) => {
          if (loading)
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          if (error)
            return (
              <ErrorComponent
                iconName="error"
                refetchData={refetch}
                errorMessage={error.message}
                isSnackBarVisible={error ? true : false}
                snackBarActionText="Retry"
              />
            );

          return (
            <View style={styles.container}>
              <View>
                <RecentActivity
                  refreshing={loading}
                  navigation={this.props.navigation}
                  events={data.allEvents}
                  handleScroll={() =>
                    fetchMore({
                      variables: { offset: data.allEvents.length },
                      updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult) return prev;
                        return Object.assign({}, prev, {
                          allEvents: [
                            ...prev.allEvents,
                            ...fetchMoreResult.allEvents
                          ]
                        });
                      }
                    })
                  }
                  noDataMessage="There is no recent activity to display."
                  onRefresh={refetch}
                />
              </View>
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  leftIcon: {
    marginLeft: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
