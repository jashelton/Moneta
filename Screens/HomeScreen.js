import React from 'react';
import { View, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { Icon } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import RecentActivity from '../Components/RecentActivity';
import { LocationHelper, permissionsHelper } from '../Helpers';
import { listRecentActivity, loadMoreRows, clearErrors } from '../reducer'
import { connect } from 'react-redux';
import SnackBar from 'react-native-snackbar-component'
import FilterRecentActivityModal from '../Components/FilterRecentActivityModal';

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
      appState: AppState.currentState
    };

    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateSocialSelected = this.updateSocialSelected.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    await permissionsHelper.registerForPushNotificationsAsync();

    const { coords } = await LocationHelper.getCurrentLocation();

    this.getActivity();

    this.props.navigation.setParams({
      toggleIsVisible: () => this.toggleIsVisible(),
      showFilterList: () => this.setState({filtersVisible: !this.state.filtersVisible}),
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.getActivity();
    }
    this.setState({appState: nextAppState});
  }

  async getActivity() {
    const { socialSelected } = this.state;
    const { listRecentActivity } = this.props;

    try {
      // For nearby events, pass coords as second parameter
      const response = await listRecentActivity(socialSelected || 'All', null, 0);
      if (response.error) throw(response.error);
    } catch(err) {
      throw(err);
    }
  }

  // Should be changed... if a user has already loaded more posts, its bad to clear that out.
  // Refresh should check if there are any events newer that the most recent event.
  _onRefresh() {
    this.setState({ refreshing: true });
    this.getActivity();
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
    if (!this.props.loading && offset >= 10) {
      this.props.loadMoreRows(this.state.socialSelected, null, offset);
    }
  }

  render() {
    const { navigation, recentEvents, loading } = this.props;
    const { filtersVisible, socialSelected, refreshing } = this.state;

    return(
      <View style={styles.container}>
        <FilterRecentActivityModal
          filtersVisible={filtersVisible}
          setVisibility={() => this.setState({filtersVisible: !this.state.filtersVisible})}
          socialSelected={socialSelected}
          updateSocialSelected={(option) => this.updateSocialSelected(option)}
        />
        { recentEvents.length ?
          <View>
            <RecentActivity
              refreshing={refreshing}
              navigation={navigation}
              events={recentEvents}
              handleScroll={this.handleScroll}
              noDataMessage='There is no recent activity to display.'
              _onRefresh={this._onRefresh}
            />
          </View>
        : loading && !recentEvents.length ?
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        :
          <View style={styles.container}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Icon
                containerStyle={styles.rightIcon}
                size={36}
                name='refresh'
                color={PRIMARY_DARK_COLOR}
                onPress={() => this.getActivity()}
              />
            </View>
            <SnackBar
              visible={this.props.error ? true : false}
              textMessage={this.props.error}
              actionHandler={() => this.props.clearErrors()}
              actionText="close"
            />
          </View>
        }
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
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  listRecentActivity,
  loadMoreRows,
  clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
