import React from "react";
import { graphql } from "react-apollo";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { WaveIndicator } from "react-native-indicators";
import { permissionsHelper, adHelper } from "../Helpers";
import RecentActivity from "../Components/RecentActivity";
import ErrorComponent from "../Components/ErrorComponent";
import { ALL_EVENTS_QUERY } from "../graphql/queries";
import FiltersModal from "../Components/FiltersModal";

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Recent Activity",
      headerLeft: (
        <Button
          containerStyle={styles.leftIcon}
          clear
          title="Filter"
          titleStyle={{ color: "blue" }}
          onPress={navigation.getParam("showModal")}
        />
      )
    };
  };

  state = {
    filtersModalVisible: false,
    rateLimit: 0
  };

  async componentDidMount() {
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    permissionsHelper.registerForPushNotificationsAsync();

    this.props.navigation.setParams({
      showModal: () => this.setState({ filtersModalVisible: true })
    });
  }

  _updateFilters = selected => {
    this.setState({ rateLimit: selected.rank });
    this.props.data.refetch({ offset: 0, rate_threshold: selected.rank });
  };

  render() {
    const { filtersModalVisible, rateLimit } = this.state;
    const { loading, error, refetch, allEvents: events } = this.props.data;

    if (loading)
      return (
        <View style={styles.loadingContainer}>
          <WaveIndicator />
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
        <RecentActivity
          loading={loading}
          navigation={this.props.navigation}
          events={events}
          handleScroll={() =>
            fetchMore({
              variables: { offset: events.length },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return Object.assign({}, prev, {
                  allEvents: [...prev.allEvents, ...fetchMoreResult.allEvents]
                });
              }
            })
          }
          noDataMessage="There is no recent activity to display."
          onRefresh={refetch}
        />
        <View style={{ position: "absolute", bottom: 0 }}>
          {adHelper.displayPublisherBanner()}
        </View>

        <FiltersModal
          isVisible={filtersModalVisible}
          rateLimit={rateLimit}
          toggleVisibility={() =>
            this.setState({ filtersModalVisible: !filtersModalVisible })
          }
          onSetFilters={this._updateFilters}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 55
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

export default graphql(ALL_EVENTS_QUERY, {
  options: { variables: { offset: 0, rate_threshold: 3 } } // TODO: Need to get this from previous selection || default
})(HomeScreen);
