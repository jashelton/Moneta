import React from "react";
import { Query } from "react-apollo";
import { View, StyleSheet } from "react-native";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";
import { WaveIndicator } from "react-native-indicators";
import RecentActivity from "../Components/RecentActivity";
import { authHelper } from "../Helpers";
import UserInfo from "../Components/UserInfo";
import UserStats from "../Components/UserStats";
import EditProfileModal from "../Components/EditProfileModal";
import FollowsModal from "../Components/FollowsModal";
import {
  ALL_EVENTS_QUERY,
  GET_USER,
  USER_FOLLOWERS,
  USER_FOLLOWING,
  USER_MUTUAL
} from "../graphql/queries";

export default class UserDetailsScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      currentUser: null,
      editProfileModalVisible: false,
      followsModalVisibility: false,
      userId: null,
      currentUser: null,
      query: null
    };

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this.toggleFollowsModal = this.toggleFollowsModal.bind(this);
  }

  async componentDidMount() {
    const userId = this.props.navigation.getParam("userId", null);
    const currentUser = await authHelper.getCurrentUserId();

    this.setState({ currentUser, userId });
  }

  toggleFollowsModal = type => {
    const { followsModalVisibility } = this.state;
    const followsOptions = {
      following: USER_FOLLOWING,
      followers: USER_FOLLOWERS,
      mutual: USER_MUTUAL
    };

    this.setState({
      followsModalVisibility: !followsModalVisibility,
      query: followsOptions[type]
    });
  };

  _navigateToUser(userId) {
    this.toggleFollowsModal();
    this.props.navigation.replace("UserDetails", { userId });
  }

  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
  }

  _renderFollowsModal = () => {
    const { query, userId, followsModalVisibility } = this.state;
    return (
      <Query query={query} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          const response =
            query === USER_FOLLOWERS
              ? data.userFollowers
              : query === USER_FOLLOWING
                ? data.userFollowing
                : data.userMutual;
          if (loading)
            return (
              <View>
                <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
              </View>
            );

          return (
            <FollowsModal
              isVisible={followsModalVisibility}
              toggleFollowsModal={() => this.toggleFollowsModal()}
              followsList={response}
              navigateToUser={userId => this._navigateToUser(userId)}
            />
          );
        }}
      </Query>
    );
  };

  _renderProfileModal = () => {
    const { editProfileModalVisible, currentUser } = this.state;
    return (
      <Query query={GET_USER} variables={{ id: currentUser }}>
        {({ loading, error, data }) => {
          return (
            <EditProfileModal
              isVisible={editProfileModalVisible}
              toggleEditProfile={this.toggleEditProfile}
              userDetails={data.getUser}
            />
          );
        }}
      </Query>
    );
  };

  _renderUserProfile = () => {
    const { userId, currentUser } = this.state;

    return (
      <Query query={GET_USER} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          if (loading)
            return (
              <View>
                <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
              </View>
            );
          return (
            <UserInfo
              loading={loading}
              userDetails={data.getUser}
              currentUser={currentUser}
              toggleEditProfile={this.toggleEditProfile}
              toggleFollowsModal={data => this.toggleFollowsModal(data)}
            />
          );
        }}
      </Query>
    );
  };

  _renderUserActivity = () => {
    const { userId } = this.state;

    return (
      <Query query={ALL_EVENTS_QUERY} variables={{ offset: 0, userId: userId }}>
        {({ loading, error, data, refetch, fetchMore }) => {
          return (
            <RecentActivity
              loading={loading}
              events={data.allEvents}
              navigation={this.props.navigation}
              refreshing={loading}
              _onRefresh={refetch}
              handleScroll={() =>
                fetchMore({
                  variables: {
                    offset: data.allEvents.length,
                    user_id: userId
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev;
                    return Object.assign({}, prev, {
                      allEvents: [
                        ...prev.allEvents,
                        ...fetchMoreResult.allEvents
                      ]
                    });
                  }
                })
              }
            />
          );
        }}
      </Query>
    );
  };

  render() {
    const {
      editProfileModalVisible,
      followsModalVisibility,
      currentUser,
      query
    } = this.state;
    return (
      <View style={styles.container}>
        {currentUser && (
          <View style={{ height: "40%" }}>{this._renderUserProfile()}</View>
        )}
        {currentUser && (
          <View style={styles.container}>{this._renderUserActivity()}</View>
        )}
        {editProfileModalVisible && this._renderProfileModal()}
        {followsModalVisibility && query && this._renderFollowsModal()}}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  rightIcon: {
    marginRight: 15
  },
  modalHeader: {
    height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  editImageContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 25
  },
  editProfileBody: {
    padding: 15
  }
});
