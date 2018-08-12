import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import RecentActivity from '../Components/RecentActivity';
import { LocationHelper, permissionsHelper } from '../Helpers';
import { listRecentActivity, loadMoreRows } from '../reducer'
import { connect } from 'react-redux';

class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Recent Events' };

  constructor(props) {
    super(props);

    this.state = {
      refreshing: false
    };

    this._onRefresh = this._onRefresh.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    // Get permissions from user for push notifications.
    // If agreed, user.push_token will be updated to store push token in db.
    await permissionsHelper.registerForPushNotificationsAsync();

    const { coords } = await LocationHelper.getCurrentLocation();

    this.props.listRecentActivity('all', null, 0);
    // For nearby events, pass coords as second parameter
  }

  // Should be changed... if a user has already loaded more posts, its bad to clear that out.
  // Refresh should check if there are any events newer that the most recent event.
  _onRefresh() {
    this.setState({ refreshing: true });
    this.props.listRecentActivity('all', null, 0);
    this.setState({ refreshing: false });
  }

  handleScroll(offset) {
    if (!this.props.loading) {
      this.props.loadMoreRows('all', null, offset);
    }
  }

  render() {
    const { navigation, loading, recentEvents } = this.props;
    const { refreshing } = this.state;

    return(
      <View style={styles.container}>
        { recentEvents && recentEvents.length ?
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
        :
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
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
