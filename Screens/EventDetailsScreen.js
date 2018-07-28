import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Divider, Icon } from 'react-native-elements';
import { eventsService } from '../Services';

export class EventDetailsHeader extends React.Component {
  render() {
    return(
      <View>
        <Text>
          {this.props.title}
        </Text>
      </View>
    );
  }
}

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      numComments: null
    }
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const event = navigation.getParam('event', null);

    this.setState({ event });

    const { data } = await eventsService.getEventDetails(event.id);
    this.setState({ numComments: data.numComments });
  }

  async favoriteEvent(eventId) {
    const { event } = this.state;
    event.liked = !event.liked;
    this.setState({ event });
    const { data } = await eventsService.likeEvent(eventId, event.liked);
  }

  render() {
    const { event, numComments } = this.state;

    if (event) {
      return(
        <Card
          title={<EventDetailsHeader title={event.title} />}
          containerStyle={styles.container}
        >
          <ScrollView contentContainerStyle={{height: '100%'}}>
            <Image style={styles.uploadedImage} source={{uri: event.image.location}} />
            <View style={styles.iconGroup}>
              <View style={styles.iconWrapper}>
                <Icon
                  style={styles.rightIcon}
                  color='#fb3958'
                  name={!event.liked ? 'favorite-border' : 'favorite'}
                  onPress={() => this.favoriteEvent(event.id)}
                />
                <Text>{numComments}</Text>
              </View>
              <View style={styles.iconWrapper}>
                <Icon
                  style={styles.rightIcon}
                  color='#fb3958'
                  name='comment'
                  // onPress={() => this.goToCommen(event.id)} //this.props.navigation.natigate('Comments', eventInfo)
                />
                <Text>0</Text>
              </View>
            </View>
            <Divider style={{marginBottom: 15}} />
            <Text>{event.description}</Text>
          </ScrollView>
        </Card>
      ); 
    } else {
      return(<View style={styles.container}> <ActivityIndicator /> </View>)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15
  },
  rightIcon: {
    marginRight: 10
  },
  uploadedImage: {
    width: '100%',
    height: '50%',
    borderRadius: 2,
  },
  iconGroup: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

