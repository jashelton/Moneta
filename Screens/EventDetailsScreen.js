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
import { authHelper, LocationHelper } from '../Helpers';
import { WARNING_RED, ACCENT_COLOR, PRIMARY_DARK_COLOR, DIVIDER_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import { updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails } from '../reducer';
import { notificationService } from '../Services/notification.service';
import ImageViewer from 'react-native-image-zoom-viewer';
import { EVENT_DETAILS_AD_UNIT } from 'react-native-dotenv';
import { AdMobBanner } from 'expo';

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
    const currentLocation = await LocationHelper.getCurrentLocation();
    const eventId = this.props.navigation.getParam('eventId', null);

    try {
      const response = await this.props.getEventDetails(eventId, currentLocation);
      if (response.error) throw(response.error);

      this.setState({ currentUserId, eventId });
    } catch(err) {
        this.props.navigation.goBack();
        throw(err);
    }

    // This doesn't need to be triggered if the event has already been viewed.
    // Stop calling getDetails method on other screens.  Just add it here and pass event id in params.
    if (!this.props.event.viewed_id) {
      this.markEventAsViewed();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = async (nextAppState) => {
    const { eventId } = this.state;
    const currentLocation = await LocationHelper.getCurrentLocation();

    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      try {
        const response = await this.props.getEventDetails(eventId, currentLocation);
        if (response.error) {
          this.props.navigation.navigate('Recent');
        }
      } catch(err) {
        this.props.navigation.navigate('Recent');
      }
    }
    this.setState({ appState: nextAppState });
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

    await this.props.updateEventDetailsLikes(event.id, event.liked);

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

  deleteEvent() {
    const { event, navigation, deleteEvent } = this.props;
    deleteEvent(event.id);
    navigation.goBack();
  }

  render() {
    const { currentUserId, isImageZoomed } = this.state;
    const { event } = this.props;

    if (!this.props.loading && event.id) {
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
                  { event.privacy === 'Private' &&
                    <View style={styles.privacyOverlay}>
                      <Icon color={DIVIDER_COLOR} name='lock' />
                    </View>
                  }
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
            <AdMobBanner
              bannerSize="smartBannerPortrait"
              adUnitID={process.env.NODE_ENV === 'development' ? 'ca-app-pub-3940256099942544/6300978111' : EVENT_DETAILS_AD_UNIT}
              // adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              testDeviceID="EMULATOR"
              onDidFailToReceiveAdWithError={this.bannerError}
            />
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
  privacyOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'flex-end'
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
  updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsScreen);
