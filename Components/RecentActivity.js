import React from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { LocationHelper } from '../Helpers';
import { getEventDetails } from '../reducer';

class RecentActivity extends React.Component {

  async setEventDetails(eventId) {
    const { navigation } = this.props;
    const currentLocation = await LocationHelper.getCurrentLocation();

    this.props.getEventDetails(eventId, currentLocation);
    navigation.navigate('EventDetails')
  }

  render() {
    const { events, navigation } = this.props;

    return(
      <ScrollView contentContainerStyle={styles.container}>
        { !events ? // Events haven't loaded
          <View><ActivityIndicator /></View>
        : events && !events.length ? // Event are loaded and empty
          <View style={{padding: 25}}>
            <Text style={styles.lightText}>{this.props.noDataMessage}</Text>
          </View>
        : // Events are loaded and exist
          <View>
            { events.map((event, i) => (
              <ListItem
                key={i}
                leftAvatar={{ source: {uri: event.image}}}
                title={event.title}
                subtitle={event.name ? event.name : null}
                containerStyle={{backgroundColor: PRIMARY_DARK_COLOR}}
                titleStyle={{color: '#fff'}}
                subtitleStyle={{fontSize: 12, color: 'grey'}}
                chevron
                bottomDivider
                onPress={() => this.setEventDetails(event.id)}
              />
            ))}
          </View>
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lightText: {
    color: '#fff'
  }
});

RecentActivity.propTypes = {
  events: PropTypes.array.isRequired
}

const mapStateToProps = state => {
  return {
    event: state.event
  };
};

const mapDispatchToProps = {
  getEventDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(RecentActivity);