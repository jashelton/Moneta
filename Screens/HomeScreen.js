import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import RecentActivity from '../Components/RecentActivity';
import { LocationHelper, permissionsHelper } from '../Helpers';
import { listRecentActivity, loadMoreRows } from '../reducer'
import { connect } from 'react-redux';
import FilterRecentActivityModal from '../Components/FilterRecentActivityModal';
import gql from 'graphql-tag';

import EventsComponent from '../Components/EventsQL';

const FETCH_EVENTS = gql`
  query {
    events {
      owner {
        first_name
        last_name
      }
      title
      description
      image
      city
      region
      country_code
    }
  }
`;

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Recent Events',
      headerLeft: (
        <Icon
          containerStyle={styles.leftIcon}
          size={28}
          name="filter-list"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam('showFilterList')}
        />
      )
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      filtersVisible: false,
      socialSelected: 'All',
    };

    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateSocialSelected = this.updateSocialSelected.bind(this);
  }

  async componentDidMount() {
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    await permissionsHelper.registerForPushNotificationsAsync();

    const { coords } = await LocationHelper.getCurrentLocation();

    this.props.listRecentActivity(this.state.socialSelected, null, 0);
    // For nearby events, pass coords as second parameter

    this.props.navigation.setParams({
      toggleIsVisible: () => this.toggleIsVisible(),
      showFilterList: () => this.setState({filtersVisible: !this.state.filtersVisible}),
    });
  }

  // Should be changed... if a user has already loaded more posts, its bad to clear that out.
  // Refresh should check if there are any events newer that the most recent event.
  _onRefresh() {
    this.setState({ refreshing: true });
    this.props.listRecentActivity(this.state.socialSelected, null, 0);
    this.setState({ refreshing: false });
  }

  toggleIsVisible() {
    this.setState({isVisible: !this.state.isVisible});
  }

  updateSocialSelected(option) {
    this.setState({socialSelected: option});
    this.props.listRecentActivity(option, null, 0);
  }

  handleScroll(offset) {
    if (!this.props.loading && offset > 10) {
      this.props.loadMoreRows(this.state.socialSelected, null, offset);
    }
  }

  render() {
    const { navigation, recentEvents } = this.props;
    const { filtersVisible, socialSelected, refreshing } = this.state;
    return(
      <View style={styles.container}>
        <FilterRecentActivityModal
          filtersVisible={filtersVisible}
          setVisibility={() => this.setState({filtersVisible: !this.state.filtersVisible})}
          socialSelected={socialSelected}
          updateSocialSelected={(option) => this.updateSocialSelected(option)}
        />

        <EventsComponent query={FETCH_EVENTS}/>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftIcon: {
    marginLeft: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const mapStateToProps = state => {
  return {
    recentEvents: state.recentEvents,
    loading: state.loading
  };
};

const mapDispatchToProps = {
  listRecentActivity,
  loadMoreRows
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
