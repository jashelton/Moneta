import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import RecentActivity from '../Components/RecentActivity';
import { LocationHelper } from '../Helpers';
import { listRecentActivity } from '../reducer'
import { connect } from 'react-redux';

class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Recent Events' };

  constructor(props) {
    super(props);

    this.state = {
      refreshing: false
    };

    this._onRefresh = this._onRefresh.bind(this);
  }

  async componentDidMount() {
    const { coords } = await LocationHelper.getCurrentLocation();

    this.props.listRecentActivity('all', null);
    // For nearby events, pass coords as second parameter
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    this.props.listRecentActivity('all', null);
    this.setState({ refreshing: false });
  }

  render() {
    const { navigation, loading, recentEvents } = this.props;
    const { refreshing } = this.state;

    return(
      <View style={styles.container}>
        { !loading ?
          <View>
            <RecentActivity
              refreshing={refreshing}
              navigation={navigation}
              events={recentEvents}
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
  listRecentActivity
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
