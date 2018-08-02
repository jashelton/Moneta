import React from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import PropTypes from 'prop-types';

export default class RecentActivity extends React.Component {
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
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
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
