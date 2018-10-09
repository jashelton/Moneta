import React from "react";
import { Query } from "react-apollo";
import { ALL_EVENTS_QUERY } from "../graphql/queries";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl
} from "react-native";
import { Button } from "react-native-elements";
import { WaveIndicator } from "react-native-indicators";
import {
  permissionsHelper,
  commonHelper,
  PublisherBannerComponent
} from "../Helpers";
import RecentActivity from "../Components/RecentActivity";
import ErrorComponent from "../Components/ErrorComponent";
import FiltersModal from "../Components/FiltersModal";

export default class HomeScreen extends React.Component {
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

  constructor(props) {
    super(props);
    this.state = {
      filtersModalVisible: false,
      filters: {},
      bannerError: false
    };

    this._updateFilters = this._updateFilters.bind(this);
  }

  async componentDidMount() {
    permissionsHelper.registerForPushNotificationsAsync();

    const filters = await commonHelper.getFilters();
    this.setState({ filters });

    this.props.navigation.setParams({
      showModal: () => this.setState({ filtersModalVisible: true })
    });
  }

  _updateFilters(rateLimit) {
    const { filters } = this.state;
    filters.events.rateLimit = rateLimit;
    this.setState({ filters });
    commonHelper.setFilters(filters);
  }

  render() {
    const { filtersModalVisible, filters } = this.state;

    return (
      <View style={styles.container}>
        {filters &&
          filters.events &&
          filters.events.rateLimit > -1 && (
            <Query
              query={ALL_EVENTS_QUERY}
              variables={{
                offset: 0,
                rate_threshold: filters.events.rateLimit
              }}
            >
              {({ loading, error, data: { allEvents: events }, refetch }) => {
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

                if (!events.length) {
                  return (
                    <ScrollView
                      contentContainerStyle={styles.loadingContainer}
                      refreshControl={
                        <RefreshControl
                          refreshing={loading}
                          onRefresh={refetch}
                        />
                      }
                    >
                      <Text>No recent activity to display.</Text>
                      <FiltersModal
                        isVisible={filtersModalVisible}
                        rateLimit={filters.events.rateLimit}
                        toggleVisibility={() =>
                          this.setState({
                            filtersModalVisible: !filtersModalVisible
                          })
                        }
                        onSetFilters={selected => {
                          refetch({ offset: 0, rate_threshold: selected.rank });
                          this._updateFilters(selected.rank);
                        }}
                      />
                    </ScrollView>
                  );
                }
                return (
                  <View
                    style={
                      !this.state.bannerError ? { paddingBottom: 55 } : null
                    }
                  >
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

                    <PublisherBannerComponent
                      bannerError={() => this.setState({ bannerError: true })}
                    />

                    <FiltersModal
                      isVisible={filtersModalVisible}
                      rateLimit={filters.events.rateLimit}
                      toggleVisibility={() =>
                        this.setState({
                          filtersModalVisible: !filtersModalVisible
                        })
                      }
                      onSetFilters={selected => {
                        refetch({ offset: 0, rate_threshold: selected.rank });
                        this._updateFilters(selected.rank);
                      }}
                    />
                  </View>
                );
              }}
            </Query>
          )}
      </View>
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
