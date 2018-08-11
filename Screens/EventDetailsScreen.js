import React from 'react';
import { ScrollView, View, Image, Text, StyleSheet, ActivityIndicator, AlertIOS, Modal } from 'react-native';
import { Card, Divider, Icon, Button, ListItem } from 'react-native-elements';
import { authHelper, LocationHelper } from '../Helpers';
import { WARNING_RED, ACCENT_COLOR, PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import { updateEventDetailsLikes, deleteEvent } from '../reducer';
import { notificationService } from '../Services/notification.service';

export class EventDetailsHeader extends React.Component {
  render() {
    return(
      <View style={styles.headerContainer}>
        <View>
          <ListItem />
          <Text style={{ color: 'blue', fontWeight: '400'}} onPress={() => this.props.navigation.navigate('UserDetails', {userId: this.props.creator})}>{this.props.name}</Text>
          <Text style={styles.subText}>{new Date(this.props.date).toISOString().substring(0, 10)}</Text>
        </View>
        <View>
          <Icon name='more-vert' onPress={this.props.setVisibility}/>
        </View>
      </View>
    );
  }
}

class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      isVisible: false
    }

    this.incrementCommentCount = this.incrementCommentCount.bind(this);
    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this.toggleVisibility = this.toggleVisibility.bind(this);
  }

  async componentDidMount() {
    const user = await authHelper.getParsedUserData();
    this.setState({user});
  }

  async favoriteEvent() {
    const { event } = this.props;
    this.props.updateEventDetailsLikes(event.id, event.liked);

    if (!event.liked) { // This actually means if the event is being liked.  Should refactor this for readability.
      // TODO: Figure out how I want to phrase notifications
      await notificationService.sendPushNotification('Someone liked your event!', event.title);
    }
  }

  incrementCommentCount() {
    const { event } = this.props;
    event.comment_count ++;

    this.setState({ event });
  }

  verifyDeleteEvent() {
    AlertIOS.alert(
      'Delete Event',
      `Are you sure you want to delete: ${this.props.event.title}?`,
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

  deleteEvent() {
    const { event, navigation, deleteEvent } = this.props;
    deleteEvent(event.id);
    navigation.goBack();
  }

  toggleVisibility() {
    this.setState({isVisible: !this.state.isVisible});
  }

  render() {
    const { user, isVisible } = this.state;
    const { event } = this.props;

    if (!this.props.loading) {
      return(
        <View style={styles.container}>
          <Card
            title={ <EventDetailsHeader
                      date={event.created_at}
                      creator={event.user_id}
                      name={event.name}
                      setVisibility={this.toggleVisibility}
                      navigation={this.props.navigation}
                    />
                  }
            containerStyle={styles.container}
          >
            <ScrollView contentContainerStyle={{height: '100%'}}>
              <Image style={styles.uploadedImage} source={{uri: event.image}} />
              <View style={styles.iconGroup}>
                <View style={styles.iconWrapper}>
                  <Icon
                    style={styles.rightIcon}
                    color='#fb3958'
                    name={!event.liked ? 'favorite-border' : 'favorite'}
                    onPress={() => this.favoriteEvent()}
                  />
                  <Text style={styles.socialCount}>{event.likes_count || ''}</Text>
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
            </ScrollView>
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

          <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
          >
            <View style={styles.modalHeader}>
              <Button title='Cancel' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={() => this.setState({isVisible: false})}/>
              <Button title='Save' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.createEvent}/>
            </View>
            <View style={{flexDirection: 'column', padding: 15}}>
              <Text>Hello</Text>
            </View>
          </Modal>
        </View>
      ); 
    } else {
      return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
    overflow: 'hidden'
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
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deleteEventBtn: {
    marginRight: 15,
    marginLeft: 15,
  },
  modalHeader: {
    height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});

const mapStateToProps = state => {
  return {
    event: state.event,
    loading: state.loading
  };
};

const mapDispatchToProps = {
  updateEventDetailsLikes, deleteEvent
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsScreen);
