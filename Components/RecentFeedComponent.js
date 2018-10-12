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
import { WaveIndicator } from "react-native-indicators";
import RecentActivity from "../Components/RecentActivity";
import ErrorComponent from "../Components/ErrorComponent";
import FiltersModal from "../Components/FiltersModal";

export const RecentFeedComponent = props => {
  return (
    <View style={{ flex: 1 }}>
      {props.index === props.thisIndex && (
        <Query query={ALL_EVENTS_QUERY} variables={props.variables}>
          {({ loading, error, data: { allEvents: events }, refetch }) => {
            if (loading)
              return (
                <View style={styles.container}>
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
                  contentContainerStyle={styles.container}
                  refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refetch} />
                  }
                >
                  <Text>No recent activity to display.</Text>
                  <FiltersModal
                    isVisible={props.filtersModalVisible}
                    rateLimit={props.filters.events.rateLimit}
                    toggleVisibility={props.updateFiltersVisible()}
                    onSetFilters={selected => {
                      refetch({ offset: 0, rate_threshold: selected.rank });
                      this._updateFilters(selected.rank);
                    }}
                  />
                </ScrollView>
              );
            }
            return (
              <View style={!props.bannerError ? { paddingBottom: 55 } : null}>
                <RecentActivity
                  loading={loading}
                  navigation={props.navigation}
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

                <FiltersModal
                  isVisible={props.filtersModalVisible}
                  rateLimit={props.filters.events.rateLimit}
                  toggleVisibility={() => props.updateFiltersVisible()}
                  onSetFilters={selected => {
                    refetch({ offset: 0, rate_threshold: selected.rank });
                    props.updateFilters(selected.rank);
                  }}
                />
              </View>
            );
          }}
        </Query>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
