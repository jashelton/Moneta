import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  permissionsHelper,
  commonHelper,
  PublisherBannerComponent
} from "../Helpers";
import { Button } from "react-native-elements";
import { TabView, SceneMap } from "react-native-tab-view";
import { RecentFeedComponent } from "../Components/RecentFeedComponent";

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
      bannerError: false,
      // tabs
      index: 0,
      routes: [
        { key: "first", title: "Public" },
        { key: "second", title: "Following" }
      ]
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
    const { filtersModalVisible, filters, index } = this.state;
    const { width, height } = Dimensions.get("window");

    return (
      <View style={styles.container}>
        {filters &&
          filters.events && (
            <TabView
              navigationState={this.state}
              renderScene={SceneMap({
                first: () => (
                  <RecentFeedComponent
                    variables={{
                      offset: 0,
                      rate_threshold: filters.events.rateLimit
                    }}
                    filters={filters}
                    filtersModalVisible={filtersModalVisible}
                    bannerError={this.state.bannerError}
                    setBannerError={() => this.setState({ bannerError: true })}
                    navigation={this.props.navigation}
                    index={index}
                    thisIndex={0}
                    updateFiltersVisible={() =>
                      this.setState({
                        filtersModalVisible: !filtersModalVisible
                      })
                    }
                  />
                ),
                second: () => (
                  <RecentFeedComponent
                    variables={{
                      offset: 0,
                      rate_threshold: filters.events.rateLimit,
                      following: true
                    }}
                    filters={filters}
                    filtersModalVisible={filtersModalVisible}
                    bannerError={this.state.bannerError}
                    setBannerError={() => this.setState({ bannerError: true })}
                    navigation={this.props.navigation}
                    index={index}
                    thisIndex={1}
                    updateFiltersVisible={() =>
                      this.setState({
                        filtersModalVisible: !filtersModalVisible
                      })
                    }
                  />
                )
              })}
              onIndexChange={index => this.setState({ index })}
              initialLayout={{ width, height }}
            />
          )}
        <PublisherBannerComponent
          bannerError={() => this.setState({ bannerError: true })}
        />
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
  }
});
