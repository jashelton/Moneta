import React from "react";
import { Query } from "react-apollo";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import {
  PRIMARY_DARK_COLOR,
  ACCENT_COLOR
} from "../common/styles/common-styles";
import { Icon } from "react-native-elements";
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

export default class MyProfileScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();

    this.state = {
      currentUser: null,
      editProfileModalVisible: false,
      followsModalVisibility: false,
      query: null
    };

    this.toggleEditProfile = this.toggleEditProfile.bind(this);
    this.toggleFollowsModal = this.toggleFollowsModal.bind(this);
    this._navigateToUser = this._navigateToUser.bind(this);
  }

  async componentDidMount() {
    const currentUser = await authHelper.getCurrentUserId();
    this.setState({ currentUser });
  }

  toggleEditProfile() {
    const { editProfileModalVisible } = this.state;
    this.setState({ editProfileModalVisible: !editProfileModalVisible });
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

  _renderFollowsModal = () => {
    const { query, currentUser, followsModalVisibility } = this.state;
    return (
      <Query query={query} variables={{ id: currentUser }}>
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
                <ActivityIndicator />
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

  _renderUserProfile = () => {
    const { currentUser } = this.state;

    return (
      <Query query={GET_USER} variables={{ id: currentUser }}>
        {({ loading, error, data }) => {
          return (
            <UserInfo
              loading={loading}
              userDetails={data.getUser}
              currentUser={currentUser}
              toggleEditProfile={this.toggleEditProfile}
              toggleFollowing={() => this.toggleFollowing()}
              toggleFollowsModal={data => this.toggleFollowsModal(data)}
            />
          );
        }}
      </Query>
    );
  };

  _renderUserActivity = () => {
    const { currentUser } = this.state;

    return (
      <Query
        query={ALL_EVENTS_QUERY}
        variables={{ offset: 0, userId: currentUser }}
      >
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
                    user_id: currentUser
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

  _navigateToUser(userId) {
    this.toggleFollowsModal();
    // TODO: This causes an issue with routing.
    this.props.navigation.navigate("UserDetails", { userId });
  }

  render() {
    const {
      editProfileModalVisible,
      followsModalVisibility,
      query
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={{ height: "40%" }}>{this._renderUserProfile()}</View>
        <View style={styles.container}>{this._renderUserActivity()}</View>
        {/* Edit Profile Modal */}
        {/* <EditProfileModal
          isVisible={editProfileModalVisible}
          toggleEditProfile={this.toggleEditProfile}
          userDetails={currentUserDetails}
        /> */}
        {followsModalVisibility && query && this._renderFollowsModal()}}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  userInfoContainer: {
    height: Dimensions.get("window").height * 0.6,
    alignItems: "center",
    justifyContent: "center"
  }
});
