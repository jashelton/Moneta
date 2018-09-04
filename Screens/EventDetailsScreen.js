import React from 'react';
import { ScrollView,
         View,
         Text,
         StyleSheet,
         ActivityIndicator,
         TouchableHighlight,
         AlertIOS,
         ImageBackground,
         AppState,
         Dimensions,
         Modal } from 'react-native';
import { Card, Divider, Icon, Button, ListItem, Avatar } from 'react-native-elements';
import { authHelper, LocationHelper, adHelper } from '../Helpers';
import { WARNING_RED, ACCENT_COLOR, PRIMARY_DARK_COLOR, DIVIDER_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import { updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails, clearErrors } from '../reducer';
import { notificationService } from '../Services/notification.service';
import ImageViewer from 'react-native-image-zoom-viewer';
import SnackBar from 'react-native-snackbar-component'

export class EventDetailsHeader extends React.Component {
  render() {
    return(
      <ListItem
        leftAvatar={
          <Avatar
            size="small"
            rounded
            source={this.props.image ? {uri: this.props.image} : null}
            icon={{name: 'person', size: 20}}
            activeOpacity={0.7}
          />
        }
        title={this.props.username || this.props.name}
        titleStyle={{ color: PRIMARY_DARK_COLOR}}
        subtitle={new Date(this.props.date).toISOString().substring(0, 10)}
        subtitleStyle={styles.subText}
        chevron
        onPress={() => this.props.navigation.navigate('UserDetails', {userId: this.props.creator})}
      />
    );
  }
}

class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId: null,
      eventId: null,
      appState: AppState.currentState,
      isImageZoomed: false
    }

    this.incrementCommentCount = this.incrementCommentCount.bind(this);
    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    const currentUserId = await authHelper.getCurrentUserId();
    const eventId = this.props.navigation.getParam('eventId', null);

    this.setState({ currentUserId, eventId });

    await this.fetchEventDetails();

    if (!this.props.event.viewed_id) {
      this.markEventAsViewed();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = async (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      try {
        this.fetchEventDetails();
      } catch(err) {
        throw(err);
      }
    }

    this.setState({ appState: nextAppState });
  }

  async fetchEventDetails() {
    if (this.props.error) this.props.clearErrors();

    const currentLocation = await LocationHelper.getCurrentLocation();
    const { eventId } = this.state;

    try {
      const response = await this.props.getEventDetails(eventId, currentLocation);
      if (response.error) throw(response.error);
    } catch(err) {
        throw(err);
    }
  }

  async markEventAsViewed() {
    const { event } = this.props;
    if (!event.viewed_id) {
      await this.props.markEventViewed(event.id);
    }
  }

  async favoriteEvent() {
    const { event } = this.props;
    const { currentUserId } = this.state;

    await this.props.updateEventDetailsLikes(event.id, event.liked, 'details');

    // If event has been disliked... needs to change for readability.
    if (event.liked) {
      notificationService.deleteNotification(event.id, event.user_id, 'like');
      return;
    }

    // If event has been liked and the creator isn't the current user, send necessary notifications.
    if (!event.liked && event.user_id !== currentUserId) {
      this.notify();
    }
  }

  async notify() {
    const { event } = this.props;

    await notificationService.sendPushNotification(event.user_id, 'Someone liked your event!', event.title);
    notificationService.createNotification(event.id, event.user_id, 'like');
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

  async deleteEvent() {
    const { event, navigation, deleteEvent } = this.props;

    try {
      const response = await deleteEvent(event.id);
      if (response.error) throw(response.error);

      navigation.goBack();
    } catch(err) {
      throw(err);
    }
  }

  render() {
    const { currentUserId, isImageZoomed } = this.state;
    const { event } = this.props;

    if (this.props.loading) {
      return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    if (event.id) {
      return(
        <View style={styles.container}>
          <Card
            title={ <EventDetailsHeader
                      date={event.created_at}
                      creator={event.user_id}
                      name={event.name}
                      username={event.username}
                      image={event.user_image}
                      navigation={this.props.navigation}
                    />
                  }
            containerStyle={styles.container}
            wrapperStyle={{flex: 1}}
          >
            <ScrollView>
              <TouchableHighlight onPress={() => this.setState({ isImageZoomed: true })}>
                <ImageBackground
                  style={styles.uploadedImage}
                  resizeMode='cover'
                  source={{uri: event.image}}
                >
                  <View style={styles.imageTopOverlay}>
                    <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                      <Icon color={PRIMARY_DARK_COLOR} name='visibility' />
                      <Text style={{ color: '#000', marginLeft: 5, fontWeight: 'bold' }}>{event.view_count}</Text>
                      { event.recent_views &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                          <Icon color='green' name='arrow-upward' />
                          <Text style={{ color: '#000', marginLeft: 5, fontWeight: 'bold' }}>{event.recent_views}</Text>
                        </View>
                      }
                    </View>
                    { event.privacy === 'Private' &&
                      <Icon color='red' name='lock' />
                    }
                  </View>
                </ImageBackground>
              </TouchableHighlight>

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
                    onPress={() => this.props.navigation.navigate('Comments', { event: event, incrementCommentCount: this.incrementCommentCount.bind(this) })}
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
          { event.user_id && event.user_id === currentUserId ?
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
          :
            adHelper.displayPublisherBanner()
          }

          {/* Modal to display full screen image with zoom */}
          <Modal visible={isImageZoomed} transparent={true} onRequestClose={() => this.setState({ isImageZoomed: false })}>
            <ImageViewer
              imageUrls={[{url: event.image}]}
              index={0}
              onSwipeDown={() => this.setState({ isImageZoomed: false })}
              enableSwipeDown={true}
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              renderHeader={() => 
                <TouchableHighlight
                  style={{ position: 'absolute', width: '100%', padding: 15, alignItems: 'flex-end', zIndex: 10000 }}
                  onPress={() => this.setState({ isImageZoomed: false })}
                >
                  <Icon name='close' size={38} color="#fff" />
                </TouchableHighlight>
              }
            />
          </Modal>
          <SnackBar
            visible={this.props.error ? true : false}
            textMessage={this.props.error}
            actionHandler={() => this.props.clearErrors()}
            actionText="close"
          />
        </View>
      ); 
    } else {
      return(
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              size={36}
              name='refresh'
              color={PRIMARY_DARK_COLOR}
              onPress={() => this.fetchEventDetails()}
            />
          </View>
          <SnackBar
            visible={this.props.error ? true : false}
            textMessage={this.props.error}
            actionHandler={() => this.props.clearErrors()}
            actionText="close"
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 5,
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
    height: Dimensions.get('window').height / 2,
    borderRadius: 2,
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  }
});

const mapStateToProps = state => {
  return {
    event: state.event,
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails, clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsScreen);
