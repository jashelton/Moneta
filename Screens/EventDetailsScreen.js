import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import {
  ScrollView,
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
  Modal
} from "react-native";
import {
  PRIMARY_DARK_COLOR,
  DIVIDER_COLOR
} from "../common/styles/common-styles";
import { Icon, Input } from "react-native-elements";
import { authHelper, LocationHelper } from "../Helpers";
import { notificationService } from "../Services/notification.service";
import ImageViewer from "react-native-image-zoom-viewer";
import SnackBar from "react-native-snackbar-component";
import SocialComponent from "../Components/SocialComponent";
import ViewToggle from "../Components/ViewToggle";
import CommentsComponent from "../Components/CommentsComponent";
import { AirbnbRating } from "react-native-ratings";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import UserHeaderComponent from "../Components/UserHeaderComponent";
import ErrorComponent from "../Components/ErrorComponent";

const EVENT_QUERY = gql`
  query Event($eventId: ID!) {
    getEvent(id: $eventId) {
      id
      title
      description
      image
      avg_rating
      current_user_rating
      likes_count
      comments_count
      created_at
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
    eventComments(event_id: $eventId) {
      id
      text
      created_at
      comment_user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

@connectActionSheet
export default class EventDetailsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <Icon
          containerStyle={{ marginRight: 15 }}
          size={28}
          name="more-horiz"
          color={PRIMARY_DARK_COLOR}
          onPress={navigation.getParam("onOpenActionSheet")}
        />
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      currentUserId: null,
      eventId: null,
      isImageZoomed: false,
      commentValue: "",
      inputFocused: false,
      eventOptionsModalVisible: false,
      canRate: true
    };

    this.verifyDeleteEvent = this.verifyDeleteEvent.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
  }

  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );

    this.props.navigation.setParams({
      onOpenActionSheet: () => this._onOpenActionSheet()
    });

    const currentUserId = await authHelper.getCurrentUserId();
    const eventId = this.props.navigation.getParam("eventId", null);

    this.setState({ currentUserId, eventId });

    // if (!this.props.event.viewed_id) {
    //   this.markEventAsViewed();
    // }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({ inputFocused: true });
  }

  _keyboardDidHide() {
    this.setState({ inputFocused: false });
  }

  _onOpenActionSheet = () => {
    const actions = {
      options: ["Cancel"]
    };

    if (this.props.event.user_id === this.state.currentUserId) {
      actions.options.push("Delete");
    } else {
      actions.options.push("Report");
    }

    actions.destructiveButtonIndex = actions.options.findIndex(
      option => option === "Delete"
    );
    actions.cancelButtonIndex = actions.options.findIndex(
      option => option === "Cancel"
    );

    this.props.showActionSheetWithOptions(actions, buttonIndex => {
      const { options } = actions;

      if (options[buttonIndex] === "Delete") {
        this.verifyDeleteEvent();
      } else if (options[buttonIndex] === "Report") {
        this.selectReportReason();
      }
    });
  };

  selectReportReason = () => {
    const actions = {
      options: ["Spam", "Inappropriate", "Cancel"],
      cancelButtonIndex: 2
    };

    this.props.showActionSheetWithOptions(actions, buttonIndex => {
      const { options } = actions;
      if (options[buttonIndex] === "Cancel") return;
      this.verifyReportEvent(options[buttonIndex]);
    });
  };

  verifyReportEvent = reason => {
    Alert.alert(
      "Report",
      `Are you sure you want to report this ${
        this.props.event.event_type
      } for ${reason}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Report",
          onPress: () => this.reportEvent(reason)
        }
      ]
    );
  };

  reportEvent = async reason => {
    const { event, reportEvent, navigation } = this.props;

    try {
      const response = await reportEvent(event.id, reason.toLowerCase());
      if (response.error) throw response.error;

      navigation.goBack();
    } catch (err) {
      throw err;
    }
  };

  verifyDeleteEvent() {
    Alert.alert(
      "Delete",
      `Are you sure you want to delete this ${this.props.event.event_type}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => this.deleteEvent()
        }
      ]
    );
  }

  async deleteEvent() {
    const { event, navigation, deleteEvent } = this.props;
    this.setState({ eventOptionsModalVisible: false });

    try {
      const response = await deleteEvent(event.id);
      if (response.error) throw response.error;

      navigation.goBack();
    } catch (err) {
      throw err;
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

    await this.props.updateEventDetailsLikes(event.id, event.liked, "details");

    // If event has been disliked... needs to change for readability.
    if (event.liked) {
      notificationService.deleteNotification(event.id, event.user_id, "like");
      return;
    }

    // If event has been liked and the creator isn't the current user, send necessary notifications.
    if (!event.liked && event.user_id !== currentUserId) {
      this.notify();
    }
  }

  async notify() {
    const { event } = this.props;

    await notificationService.sendPushNotification(
      event.user_id,
      "Someone liked your event!",
      event.title
    );
    notificationService.createNotification(event.id, event.user_id, "like");
  }

  submitComment() {
    let { commentValue } = this.state;
    const { event, addCommentToEvent } = this.props;

    try {
      const { data } = addCommentToEvent(event.id, commentValue);
      Keyboard.dismiss();
    } catch (err) {
      throw err;
    }

    commentValue = "";
    this.setState({ commentValue, inputFocused: false });
  }

  async submitRating(value) {
    const { event } = this.props;
    const { canRate } = this.state;

    if (event.current_user_rating !== value && canRate) {
      this.setState({ canRate: false });

      const rating = {
        previousRating: event.current_user_rating || null,
        newRating: value
      };

      await this.props.detailsUpdateRating(event.id, rating);
    }

    this.setState({ canRate: true });
  }

  render() {
    const { isImageZoomed, commentValue, eventId } = this.state;
    const { navigation } = this.props;

    return (
      <Query query={EVENT_QUERY} variables={{ eventId }} errorPolicy="all">
        {({ loading, error, data, refetch }) => {
          const event = data.getEvent;
          const comments = data.eventComments;

          if (loading)
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );

          if (error)
            return (
              <ErrorComponent
                iconName="error"
                refetchData={refetch}
                errorMessage={error.message}
                isSnackBarVisible={error ? true : false}
                snackBarActionText="Retry"
              />
            );

          return (
            <View style={{ flex: 1 }}>
              <ScrollView>
                <UserHeaderComponent
                  user={event.user}
                  createdAt={event.created_at}
                />
                <View style={styles.eventSection}>
                  <View
                    style={{
                      alignItems: "flex-end",
                      justifyContent: "center",
                      marginRight: 15
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          alignSelf: "center",
                          fontSize: 14,
                          fontWeight: "200"
                        }}
                      >
                        {event.avg_rating
                          ? `Avg: ${event.avg_rating}`
                          : "No ratings yet."}
                      </Text>
                      <AirbnbRating
                        count={5}
                        defaultRating={event.current_user_rating || 0}
                        size={22}
                        showRating={false}
                        onFinishRating={value => this.submitRating(value)}
                      />
                      <Text
                        style={{
                          alignSelf: "center",
                          fontSize: 14,
                          fontWeight: "200"
                        }}
                      >
                        {event.current_user_rating
                          ? `My Rating: ${event.current_user_rating}`
                          : "Rate Anonymously"}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.textContent, { padding: 10 }]}>
                    {event.title && (
                      <Text style={{ fontSize: 18, fontWeight: "500" }}>
                        {event.title}
                      </Text>
                    )}
                    {event.distanceFrom &&
                      event.distanceFrom.status === "OK" && (
                        <Text style={styles.subText}>
                          {event.distanceFrom.distance.text}
                        </Text>
                      )}
                    <Text
                      style={{ fontSize: 14, fontWeight: "200", marginTop: 15 }}
                    >
                      {event.description}
                    </Text>
                  </View>
                  {event.image && (
                    <TouchableHighlight
                      onPress={() => this.setState({ isImageZoomed: true })}
                    >
                      <Image
                        style={styles.image}
                        source={{ uri: event.image }}
                      />
                    </TouchableHighlight>
                  )}
                  <SocialComponent
                    event={event}
                    navigation={navigation}
                    onLikePress={() => this.favoriteEvent()}
                    onCommentPress={() => this.commentInputField.focus()}
                  />
                </View>

                <CommentsComponent comments={comments} />

                {/* Modal to display full screen image with zoom */}
                <Modal
                  visible={isImageZoomed}
                  transparent={true}
                  onRequestClose={() => this.setState({ isImageZoomed: false })}
                >
                  <ImageViewer
                    imageUrls={[{ url: event.image }]}
                    index={0}
                    onSwipeDown={() => this.setState({ isImageZoomed: false })}
                    enableSwipeDown={true}
                    renderIndicator={() => null}
                    saveToLocalByLongPress={false}
                    renderHeader={() => (
                      <TouchableHighlight
                        style={{
                          position: "absolute",
                          width: "100%",
                          padding: 15,
                          alignItems: "flex-end",
                          zIndex: 10000
                        }}
                        onPress={() => this.setState({ isImageZoomed: false })}
                      >
                        <Icon name="close" size={38} color="#fff" />
                      </TouchableHighlight>
                    )}
                  />
                </Modal>
              </ScrollView>
              <KeyboardAvoidingView alwaysVisible={true} behavior="padding">
                <View style={styles.commentInput}>
                  <Input
                    ref={input => (this.commentInputField = input)}
                    placeholder="Comment"
                    containerStyle={{ backgroundColor: "#eee" }}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    inputStyle={{ paddingTop: 8 }}
                    value={commentValue}
                    onChangeText={value =>
                      this.setState({ commentValue: value })
                    }
                    multiline={true}
                    shake={true}
                    onFocus={() => this.setState({ inputFocused: true })}
                    onBlur={() => this.setState({ inputFocused: false })}
                    leftIcon={
                      <Icon name="comment" size={22} color={DIVIDER_COLOR} />
                    }
                  />
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      flexGrow: 1
                    }}
                  >
                    <Icon
                      name="send"
                      size={24}
                      color={
                        commentValue.length ? PRIMARY_DARK_COLOR : DIVIDER_COLOR
                      }
                      disabled={!commentValue.length}
                      onPress={this.submitComment.bind(this)}
                    />
                  </View>
                </View>
                <ViewToggle
                  hide={!this.state.inputFocused}
                  style={{ height: 65 }}
                />
              </KeyboardAvoidingView>
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    margin: 5
  },
  eventSection: {
    backgroundColor: "#fff"
  },
  commentInput: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee"
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.35
  },
  subText: {
    fontWeight: "200",
    color: "grey",
    fontSize: 12
  },
  modalHeader: {
    height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  }
});
