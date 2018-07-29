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
        <Text>{this.props.user.first_name} {this.props.user.last_name}</Text>
        <Text style={styles.subText}>{new Date(this.props.event.created_at).toISOString().substring(0, 10)}</Text>
      </View>
    );
  }
}

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      socialDetails: {},  // TODO: This isn't really 'socialDetails' anymore
      user: {}
    }

    this.favoriteEvent = this.favoriteEvent.bind(this);
    this.incrementCommentCount = this.incrementCommentCount.bind(this);
    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const event = navigation.getParam('event', null);
    navigation.setParams({ deleteEvent: () => this.deleteEvent()});

    this.setState({ event });

    const currentLocation = await LocationHelper.getCurrentLocation();
    const { data } = await eventsService.getEventDetails(event, currentLocation);
    this.setState({ socialDetails: data });

    const user = await authHelper.getParsedUserData();
    this.setState({user});
  }

  async favoriteEvent(eventId) {
    const { event, socialDetails } = this.state;
    event.liked = !event.liked;
    const { data } = await eventsService.likeEvent(eventId, event.liked);
    event.liked ? socialDetails.numLikes ++ : socialDetails.numLikes --;
    this.setState({ event });
  }

  incrementCommentCount() {
    const { socialDetails } = this.state;
    socialDetails.numComments ++;
    this.setState({ socialDetails });
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
    const { event, socialDetails, user } = this.state;

    if (event) {
      return(
        <View style={styles.container}>
          <Card
            title={<EventDetailsHeader event={event} details={socialDetails} user={user} />}
            containerStyle={styles.container}
          >
            <View style={{height: '100%'}}>
              <Image style={styles.uploadedImage} source={{uri: event.image.location}} />
              <View style={styles.iconGroup}>
                <View style={styles.iconWrapper}>
                  <Icon
                    style={styles.rightIcon}
                    color='#fb3958'
                    name={!event.liked ? 'favorite-border' : 'favorite'}
                    onPress={() => this.favoriteEvent(event.id)}
                  />
                  <Text style={styles.socialCount}>{socialDetails.numLikes}</Text>
                </View>
                <View style={styles.iconWrapper}>
                  <Icon
                    style={styles.rightIcon}
                    color='#fb3958'
                    name='comment'
                    onPress={() => this.props.navigation.navigate('Comments', { eventId: event.id, incrementCommentCount: this.incrementCommentCount.bind(this) })}
                  />
                  <Text style={styles.socialCount}>{socialDetails.numComments}</Text>
                </View>
              </View>

              <Divider style={{marginBottom: 15}} />

              <View style={styles.eventBody}>
                <View style={{marginBottom: 15}}>
                  <Text style={styles.titleText}>{event.title}</Text>
                  { socialDetails.distanceFrom && socialDetails.distanceFrom.status === 'OK' &&
                    <Text style={styles.subText}>{socialDetails.distanceFrom.distance.text}</Text>
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

