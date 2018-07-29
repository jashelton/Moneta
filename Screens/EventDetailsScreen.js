import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, AlertIOS } from 'react-native';
import { Card, Divider, Icon, Button } from 'react-native-elements';
import { eventsService } from '../Services';
import { authHelper, LocationHelper } from '../Helpers';
import { WARNING_RED } from '../common/styles/common-styles';

export class EventDetailsHeader extends React.Component {
  render() {
    return(
      <View style={styles.headerContainer}>
        <Text>{this.props.name}</Text>
        <Text style={styles.subText}>{new Date(this.props.date).toISOString().substring(0, 10)}</Text>
      </View>
    );
  }
}

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      user: {}
    }

    this.favoriteEvent = this.favoriteEvent.bind(this);
    this.incrementCommentCount = this.incrementCommentCount.bind(this);
    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const eventId = navigation.getParam('eventId', null);
    navigation.setParams({ deleteEvent: () => this.deleteEvent()});

    const currentLocation = await LocationHelper.getCurrentLocation();
    const { data } = await eventsService.getEventDetails(eventId, currentLocation);
    this.setState({ event: data });

    const user = await authHelper.getParsedUserData();
    this.setState({user});
  }

  async favoriteEvent(eventId) {
    const { event } = this.state;
    event.liked = !event.liked;
    const { data } = await eventsService.likeEvent(event.id, event.liked);
    event.liked ? event.likes_count ++ : event.likes_count --;
    this.setState({ event });
  }

  incrementCommentCount() {
    const { event } = this.state;
    event.comment_count ++;
    this.setState({ event });
  }

  verifyDeleteEvent() {
    AlertIOS.alert(
      'Delete Event',
      `Are you sure you want to delete: ${this.state.event.title}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => this.deleteEvent()
        }
      ]
    )
  }

  async deleteEvent() {
    const { event } = this.state;
    const data = await eventsService.deleteEvent(event.id);

    if (data.status === 200) {
      // TODO: Filter this event out of 'markers' on MapScreen
    }
  }

  render() {
    const { event, user } = this.state;

    if (event) {
      return(
        <View style={styles.container}>
          <Card
            title={<EventDetailsHeader date={event.created_at} name={event.name} />}
            containerStyle={styles.container}
          >
            <View style={{height: '100%'}}>
              <Image style={styles.uploadedImage} source={{uri: event.image}} />
              <View style={styles.iconGroup}>
                <View style={styles.iconWrapper}>
                  <Icon
                    style={styles.rightIcon}
                    color='#fb3958'
                    name={!event.liked ? 'favorite-border' : 'favorite'}
                    onPress={() => this.favoriteEvent(event.id)}
                  />
                  <Text style={styles.socialCount}>{event.likes_count}</Text>
                </View>
                <View style={styles.iconWrapper}>
                  <Icon
                    style={styles.rightIcon}
                    color='#fb3958'
                    name='comment'
                    onPress={() => this.props.navigation.navigate('Comments', { eventId: event.id, incrementCommentCount: this.incrementCommentCount.bind(this) })}
                  />
                  <Text style={styles.socialCount}>{event.comment_count}</Text>
                </View>
              </View>

              <Divider style={{marginBottom: 15}} />

              <View style={styles.eventBody}>
                <View style={{marginBottom: 15}}>
                  <Text style={styles.titleText}>{event.title}</Text>
                  { event.distanceFrom && event.distanceFrom.status === 'OK' &&
                    <Text style={styles.subText}>{event.distanceFrom.distance.text}</Text>
                  }
                </View>
                <Text style={styles.eventText}>{event.description}</Text>
              </View>
            </View>
          </Card>
          { event.user_id && event.user_id === user.id &&
            <Button
              style={styles.deleteEventBtn}
              buttonStyle={{backgroundColor: WARNING_RED}}
              icon={
                <Icon
                  name='delete'
                  size={20}
                  color='#fff'
                />
              }
              iconLeft
              title='Delete Event'
              onPress={this.verifyDeleteEvent}
            />
          }
        </View>
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
  socialCount: {
    marginLeft: 5
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
  },
  eventBody: {
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600'
  },
  eventText: {
    fontSize: 16,
    fontWeight: '200'
  },
  subText: {
    fontWeight: '200',
    color: 'grey',
    fontSize: 12
  },
  headerContainer: {
    marginBottom: 15
  },
  deleteEventBtn: {
    marginRight: 15,
    marginLeft: 15,
  }
});

