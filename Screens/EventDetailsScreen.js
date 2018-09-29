import React from "react";
import { Query, Mutation, graphql, compose } from "react-apollo";
import {
  EVENT_QUERY,
  EVENT_COMMENTS,
  ALL_EVENTS_QUERY,
  CREATE_COMMENT,
  DELETE_EVENT,
  REPORT_EVENT
} from "../graphql/queries";
import {
  ScrollView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  Keyboard
} from "react-native";
import { WaveIndicator } from "react-native-indicators";
import {
  PRIMARY_DARK_COLOR,
  DIVIDER_COLOR
} from "../common/styles/common-styles";
import { Icon, Input } from "react-native-elements";
import { authHelper } from "../Helpers";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import ViewToggle from "../Components/ViewToggle";
import CommentsComponent from "../Components/CommentsComponent";
import UserHeaderComponent from "../Components/UserHeaderComponent";
import ErrorComponent from "../Components/ErrorComponent";
import ImageViewerComponent from "../Components/ImageViewerComponent";
import EventInfoComponent from "../Components/EventInfoComponent";
import { notificationService } from "../Services/";

@connectActionSheet
class EventDetailsScreen extends React.Component {
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
      userId: null,
      isImageZoomed: false,
      commentValue: "",
      inputFocused: false,
      activeImage: 0
    };

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
    const userId = this.props.navigation.getParam("userId", null);

    this.setState({ currentUserId, eventId, userId });
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
    const { currentUserId, userId } = this.state;
    const actions = {
      options: ["Cancel"]
    };

    if (userId === currentUserId) {
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
      `Are you sure you want to report this post for ${reason}?`,
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
    const { navigation } = this.props;

    await this.props.reportEvent({
      REPORT_EVENT,
      variables: {
        event_id: this.state.eventId,
        reason: reason.toLowerCase()
      },
      update: this.updateEventsCache
    });

    navigation.goBack();
  };

  verifyDeleteEvent() {
    Alert.alert("Delete", `Are you sure you want to delete this post?`, [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        onPress: () => this.deleteEvent()
      }
    ]);
  }

  async deleteEvent() {
    const { navigation } = this.props;

    await this.props.deleteEvent({
      DELETE_EVENT,
      variables: { id: this.state.eventId },
      update: this.updateEventsCache
    });

    navigation.goBack();
  }

  updateEventsCache = (store, { data }) => {
    let eventAction;
    if (data.deleteEvent) eventAction = data.deleteEvent;
    if (data.reportEvent) eventAction = data.reportEvent;

    try {
      const { allEvents } = store.readQuery({
        query: ALL_EVENTS_QUERY,
        variables: { offset: 0 }
      });

      if (!eventAction) return;

      const filteredEvents = allEvents.filter(e => e.id !== this.state.eventId);
      store.writeQuery({
        query: ALL_EVENTS_QUERY,
        variables: { offset: 0 },
        data: {
          allEvents: filteredEvents
        }
      });
    } catch (err) {
      throw new Error(err);
    }
  };

  submitComment({ data }) {
    Keyboard.dismiss();
    this.setState({ commentValue: "", inputFocused: false });

    const { comment_user, owner } = data.createComment;

    if (owner.push_token && comment_user.id !== this.state.userId) {
      const body = `${comment_user.first_name} ${
        comment_user.last_name
      } commented on your post.`;
      notificationService.sendPushNotification(owner.push_token, body);
    }
  }

  render() {
    const { isImageZoomed, commentValue, eventId, activeImage } = this.state;
    const { navigation } = this.props;

    return (
      <Query query={EVENT_QUERY} variables={{ eventId }} errorPolicy="all">
        {({ loading, error, data, refetch }) => {
          const event = data.getEvent;

          if (loading)
            return (
              <View style={styles.loadingContainer}>
                <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
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
                <EventInfoComponent
                  event={event}
                  navigation={navigation}
                  onImgPress={() => this.setState({ isImageZoomed: true })}
                  inputFocus={() => this.commentInputField.focus()}
                  activeImage={activeImage}
                  setActiveImage={index =>
                    this.setState({ activeImage: index })
                  }
                />
                <Query query={EVENT_COMMENTS} variables={{ eventId }}>
                  {({ loading, error, data, refetch }) => {
                    return (
                      <CommentsComponent
                        loading={loading}
                        error={error}
                        comments={data.eventComments}
                      />
                    );
                  }}
                </Query>

                <ImageViewerComponent
                  visible={isImageZoomed}
                  onClose={() => this.setState({ isImageZoomed: false })}
                  image={event.Images[activeImage].image}
                />
              </ScrollView>
              <Mutation
                mutation={CREATE_COMMENT}
                variables={{ eventId, text: commentValue }}
                refetchQueries={[
                  { query: EVENT_QUERY, variables: { eventId } }
                ]}
                update={(store, { data: { createComment } }) => {
                  const data = store.readQuery({
                    query: EVENT_COMMENTS,
                    variables: { eventId }
                  });

                  store.writeQuery({
                    query: EVENT_COMMENTS,
                    variables: { eventId },
                    data: {
                      eventComments: [...data.eventComments, createComment]
                    }
                  });
                }}
              >
                {createComment => (
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
                          <Icon
                            name="comment"
                            size={22}
                            color={DIVIDER_COLOR}
                          />
                        }
                      />
                      <View style={styles.containerCenter}>
                        <Icon
                          name="send"
                          size={24}
                          color={
                            commentValue.length
                              ? PRIMARY_DARK_COLOR
                              : DIVIDER_COLOR
                          }
                          disabled={!commentValue.length}
                          onPress={() =>
                            createComment().then(res => this.submitComment(res))
                          }
                        />
                      </View>
                    </View>
                    <ViewToggle
                      hide={!this.state.inputFocused}
                      style={{ height: 65 }}
                    />
                  </KeyboardAvoidingView>
                )}
              </Mutation>
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  commentInput: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee"
  },
  containerCenter: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1
  }
});

export default compose(
  graphql(DELETE_EVENT, { name: "deleteEvent" }),
  graphql(REPORT_EVENT, { name: "reportEvent" })
)(EventDetailsScreen);
