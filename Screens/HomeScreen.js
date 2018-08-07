import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';

import RecentActivity from '../Components/RecentActivity';
import { LocationHelper } from '../Helpers';
import { listRecentActivity } from '../reducer'
import { connect } from 'react-redux';

class HomeScreen extends React.Component {
  static navigationOptions = { title: 'Recent Events' };

  async componentDidMount() {
    const { coords } = await LocationHelper.getCurrentLocation();

    this.props.listRecentActivity('all', null);
    // For nearby events, pass coords as second parameter
  }

  render() {
    const { navigation, loading, recentEvents } = this.props;

    return(
      <View style={styles.container}>
        { !loading ?
          <RecentActivity
            navigation={navigation}
            events={recentEvents}
            noDataMessage='There is no recent activity to display.'
          />
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
    backgroundColor: PRIMARY_DARK_COLOR,
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
