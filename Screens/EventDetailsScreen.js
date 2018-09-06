import React from 'react';
import { ScrollView,
         View,
         Text,
         StyleSheet,
         ActivityIndicator,
         TouchableHighlight,
         KeyboardAvoidingView,
         AlertIOS,
         Image,
         AppState,
         Dimensions,
         Keyboard,
         Modal } from 'react-native';
import { Icon, ListItem, Avatar, Input } from 'react-native-elements';
import { authHelper, LocationHelper, adHelper } from '../Helpers';
import { PRIMARY_DARK_COLOR, DIVIDER_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';
import { updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails, clearErrors, addCommentToEvent } from '../reducer';
import { notificationService } from '../Services/notification.service';
import ImageViewer from 'react-native-image-zoom-viewer';
import SnackBar from 'react-native-snackbar-component'
import SocialComponent from '../Components/SocialComponent';
import ViewToggle from '../Components/ViewToggle';

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
      isImageZoomed: false,
      commentValue: '',
      inputFocused: false
    }

    this.incrementCommentCount = this.incrementCommentCount.bind(this);
    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

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

  render() {
    const { currentUserId, isImageZoomed, commentValue } = this.state;
    const { event, navigation } = this.props;
    let inputPosition = 0;

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
              subtitle={new Date(event.created_at).toISOString().substring(0, 10)}
              subtitleStyle={styles.subText}
              chevron
              onPress={() => navigation.navigate('UserDetails', {userId: event.user_id})}
            />
            <View style={styles.eventSection}>
              <View style={[styles.textContent, { padding: 10 }]}>
                { event.title &&
                  <Text style={{ fontSize: 18, fontWeight: '500' }}>{event.title}</Text>
                }
                <Text style={{ fontSize: 14, fontWeight: '200' }}>{event.description}</Text>
              </View>
              { event.image &&
                <TouchableHighlight onPress={() => this.setState({ isImageZoomed: true })}>
                  <Image style={styles.image} source={{uri: event.image}} />
                </TouchableHighlight>
              }
              <SocialComponent event={event} navigation={navigation} />
            </View>

            <View style={styles.commentSection}>
              { event.comments.map((comment, i) => (
                <View style={{ flexDirection: 'row', marginVertical: 5 }} key={i}>
                  <View>
                    <Avatar
                      size="small"
                      rounded
                      source={{uri: comment.profile_image}}
                      activeOpacity={0.7}
                    />
                  </View>
                  <View style={{ flex: 1, padding: 10, marginHorizontal: 10, backgroundColor: '#eee', borderRadius: 5 }}>
                    <Text style={{ fontWeight: '500', fontSize: 14 }}>{comment.name}</Text>
                    <Text style={{ fontWeight: '200' }}>{comment.text}</Text>
                  </View>
                </View>
              ))}
            </View>

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
          </ScrollView>
          <KeyboardAvoidingView
            alwaysVisible={true}
            behavior='padding'
          >
            <View style={styles.commentInput}>
              <Input
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
  commentSection: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 5
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
});

const mapStateToProps = state => {
  return {
    event: state.event,
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  updateEventDetailsLikes, deleteEvent, markEventViewed, getEventDetails, clearErrors, addCommentToEvent
};

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailsScreen);
