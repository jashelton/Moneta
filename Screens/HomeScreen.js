import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  AppState
} from "react-native";
import { Icon } from "react-native-elements";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import RecentActivity from "../Components/RecentActivity";
import { permissionsHelper } from "../Helpers";
import SnackBar from "react-native-snackbar-component";

// Apollo
import gql from "graphql-tag";
import { Query } from "react-apollo";

const EVENTS_QUERY = gql`
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
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Recent Events",
      headerLeft: (
        <Icon
          containerStyle={styles.leftIcon}
          size={28}
          name="filter-list"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam("showFilterList")}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState
    };
  }

  async componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    console.log(this.$apollo);
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    // await permissionsHelper.registerForPushNotificationsAsync();
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // this.getActivity();
      this.$apollo.queries.EVENTS_QUERY.refetch();
    }
    this.setState({ appState: nextAppState });
  };

  render() {
    return (
      <Query query={EVENTS_QUERY} variables={{ offset: 0 }}>
        {({ loading, error, data, refetch, fetchMore }) => {
          if (loading && !this.state.filtersVisible)
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          if (error)
            return (
              <View style={styles.container}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon
                    size={36}
                    name="refresh"
                    color={PRIMARY_DARK_COLOR}
                    onPress={() => this.getActivity()}
                  />
                  <Text>Could not find any events.</Text>
                </View>
                <SnackBar
                  visible={this.props.error ? true : false}
                  textMessage={this.props.error}
                  actionHandler={() => this.props.clearErrors()}
                  actionText="close"
                />
              </View>
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
                  _onRefresh={refetch}
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
