import React from 'react';
import { View,
         Text,
         ScrollView,
         ActivityIndicator,
         RefreshControl,
         Dimensions,
         FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MomentComponent from '../Components/MomentComponent';
import VibeComponent from '../Components/VibeComponent';

class RecentActivity extends React.Component {

  height = Dimensions.get('window').height / 2;

  _renderImage({item}) {
    return(
      item.event_type === 'moment' ? 
        <MomentComponent
          moment={item}
          navigation={this.props.navigation}
          height={this.height}
        /> 
        :
        <VibeComponent
          vibe={item}
          navigation={this.props.navigation}
          height={this.height}
        />
    );
  }

  render() {
    const { events, noDataMessage, refreshing, loading } = this.props;

    if (loading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }

    if (events && events.length) {
      return(
        <View style={{ paddingTop: 5 }}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            data={events}
            renderItem={this._renderImage.bind(this)}
            onEndReached={() => this.props.handleScroll(events.length)}
            onEndReachedThreshold={0}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.props._onRefresh}
              />
            }
          />
        </View>
      );
    } else {
      return(
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.props._onRefresh}
            />
          }
        >
          <Text>{ noDataMessage || 'No recent activity to display' }</Text>
        </ScrollView>
      )
    }
  }
}

RecentActivity.propTypes = {
  events: PropTypes.array.isRequired,
  refreshing: PropTypes.bool.isRequired,
  _onRefresh: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    loading: state.loading
  };
};

export default connect(mapStateToProps)(RecentActivity);