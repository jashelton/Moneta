import React from 'react';
import { ScrollView,
         View,
         Text,
         StyleSheet,
         ActivityIndicator,
         TouchableHighlight,
         KeyboardAvoidingView,
         Alert,
         Image,
         AppState,
         Dimensions,
         Keyboard,
         Modal } from 'react-native';
import { Icon, ListItem, Avatar, Input, Button } from 'react-native-elements';
import { authHelper, LocationHelper, adHelper } from '../Helpers';
import { PRIMARY_DARK_COLOR, DIVIDER_COLOR, ACCENT_COLOR, WARNING_RED } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import { updateEventDetailsLikes,
         deleteEvent,
         markEventViewed,
         getEventDetails,
         clearErrors,
         addCommentToEvent,
         detailsUpdateRating } from '../reducer';
import { notificationService } from '../Services/notification.service';
import ImageViewer from 'react-native-image-zoom-viewer';
import SnackBar from 'react-native-snackbar-component'
import SocialComponent from '../Components/SocialComponent';
import ViewToggle from '../Components/ViewToggle';
import CommentsComponent from '../Components/CommentsComponent';
import TimeAgo from 'react-native-timeago';
import { AirbnbRating } from 'react-native-ratings';

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
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <Icon
          containerStyle={{ marginRight: 15 }}
          size={28}
          name="more-horiz"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam('toggleEventOptionsModal')}
        />
      )
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      currentUserId: null,
      eventId: null,
      appState: AppState.currentState,
      isImageZoomed: false,
      commentValue: '',
      inputFocused: false,
      eventOptionsModalVisible: false,
      canRate: true
    }

    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this.toggleEventOptionsModal = this.toggleEventOptionsModal.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

    this.props.navigation.setParams({
      toggleEventOptionsModal: () => this.toggleEventOptionsModal()
    });

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
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
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

  _keyboardDidShow () {
    this.setState({ inputFocused: true });
  }

  _keyboardDidHide () {
    this.setState({ inputFocused: false });
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

  toggleEventOptionsModal() {
    this.setState({ eventOptionsModalVisible: !this.state.eventOptionsModalVisible });
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

  verifyDeleteEvent() {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete this ${this.props.event.event_type}?`,
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
    this.setState({ eventOptionsModalVisible: false });

    try {
      const response = await deleteEvent(event.id);
      if (response.error) throw(response.error);

      navigation.goBack();
    } catch(err) {
      throw(err);
    }
  }

  submitComment() {
    let { commentValue } = this.state;
    const { event, addCommentToEvent } = this.props;
    
    try {
      const { data } = addCommentToEvent(event.id, commentValue);
      Keyboard.dismiss();
    } catch(err) {
      throw(err);
    }

    commentValue = '';
    this.setState({ commentValue, inputFocused: false });
  }

  async submitRating(value) {
    const { event } = this.props;
    const { canRate } = this.state;

    if (event.rating.user_rating !== value && canRate) {
      this.setState({ canRate: false });

      const rating = {
        previousRating: event.rating.user_rating || null,
        newRating: value
      };

      await this.props.detailsUpdateRating(event.id, rating);
    }

    this.setState({ canRate: true });
  }

  render() {
    const { isImageZoomed, commentValue, eventOptionsModalVisible, currentUserId } = this.state;
    const { event, navigation } = this.props;

    if (this.props.loading) {
      return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator />
        </View>
      );
    }

    if (event.id) {
      return(
        <View style={{ flex: 1 }}>
          <ScrollView>
            <ListItem
              leftAvatar={
                <Avatar
                  size="small"
                  rounded
                  source={event.profile_image ? {uri: event.profile_image} : null}
                  icon={{name: 'person', size: 20}}
                  activeOpacity={0.7}
                />
              }
              title={event.name}
              titleStyle={{ color: PRIMARY_DARK_COLOR}}
              subtitle={<TimeAgo time={event.created_at} style={styles.subText}/>}
              chevron
              onPress={() => navigation.navigate('UserDetails', {userId: event.user_id})}
            />
            <View style={styles.eventSection}>
              <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: 15 }}>
                <View>
                  <Text style={{ alignSelf: 'center', fontSize: 14, fontWeight: '200' }}>
                    {event.rating.avg_rating ? `Avg: ${event.rating.avg_rating}` : 'No ratings yet.'}
                  </Text>
                  <AirbnbRating
                    count={5}
                    defaultRating={event.rating.user_rating || 0}
                    size={22}
                    showRating={false}
                    onFinishRating={(value) => this.submitRating(value)}
                  />
                  <Text style={{ alignSelf: 'center', fontSize: 14, fontWeight: '200' }}>
                    { event.rating.user_rating ? `My Rating: ${event.rating.user_rating}` : 'Rate Anonymously'}
                  </Text>
                </View>
              </View>
              <View style={[styles.textContent, { padding: 10 }]}>
                { event.title &&
                  <Text style={{ fontSize: 18, fontWeight: '500' }}>{event.title}</Text>
                }
                { event.distanceFrom && event.distanceFrom.status === 'OK' &&
                  <Text style={styles.subText}>{event.distanceFrom.distance.text}</Text>
                }
                <Text style={{ fontSize: 14, fontWeight: '200', marginTop: 15 }}>{event.description}</Text>
              </View>
              { event.image &&
                <TouchableHighlight onPress={() => this.setState({ isImageZoomed: true })}>
                  <Image style={styles.image} source={{uri: event.image}} />
                </TouchableHighlight>
              }
              <SocialComponent
                event={event}
                navigation={navigation}
                showCommentIcon={true}
                onLikePress={() => this.favoriteEvent()}
                onCommentPress={() => this.commentInputField.focus()}
              />
            </View>

            <CommentsComponent comments={event.comments} />

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

            {/* Event Options Modal */}
            <Modal
              visible={eventOptionsModalVisible}
              animationType="slide"
              onRequestClose={() => this.setState({ eventOptionsModalVisible: false })}
            >
              <View style={styles.modalHeader}>
                <Button title='Cancel' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.toggleEventOptionsModal}/>
                <Button title='Done' titleStyle={{color: ACCENT_COLOR}} clear={true}/>
              </View>
              { event.user_id && event.user_id === currentUserId &&
                <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 5, backgroundColor: WARNING_RED }}>
                  <Button title='Delete Event' clear={true} onPress={this.verifyDeleteEvent}/>
                </View>
              }
            </Modal>
          </ScrollView>
          <KeyboardAvoidingView
            alwaysVisible={true}
            behavior='padding'
          >
            <View style={styles.commentInput}>
              <Input
                ref={(input) => this.commentInputField = input}
                placeholder='Comment'
                containerStyle={{ backgroundColor: '#eee' }}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                inputStyle={{ paddingTop: 8 }}
                value={commentValue}
                onChangeText={(value) => this.setState({ commentValue: value })}
                multiline={true}
                shake={true}
                onFocus={() => this.setState({ inputFocused: true })}
                onBlur={() => this.setState({ inputFocused: false })}
                leftIcon={
                  <Icon
                    name='comment'
                    size={22}
                    color={DIVIDER_COLOR}
                  />
                }
              />
              <View style={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                <Icon
                  name='send'
                  size={24}
                  color={commentValue.length ? PRIMARY_DARK_COLOR : DIVIDER_COLOR}
                  disabled={!commentValue.length}
                  onPress={this.submitComment.bind(this)}
                />
              </View>
            </View>
            <ViewToggle hide={!this.state.inputFocused} style={{ height: 65 }} />
          </KeyboardAvoidingView>
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
    flexDirection: 'column',
    margin: 5,
  },
  eventSection: {
    backgroundColor: '#fff'
  },
  commentInput: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.35
  },
  subText: {
    fontWeight: '200',
    color: 'grey',
    fontSize: 12
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
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  updateEventDetailsLikes,
  deleteEvent,
  markEventViewed,
  getEventDetails,
  clearErrors,
  addCommentToEvent,
  detailsUpdateRating
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsScreen);
