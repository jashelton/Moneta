import gql from "graphql-tag";

export const ALL_EVENTS_QUERY = gql`
  query AllEvents(
    $offset: Int
    $type: String
    $userId: Int
    $rate_threshold: Float
    $following: Boolean
  ) {
    allEvents(
      offset: $offset
      event_type: $type
      user_id: $userId
      rating_threshold: $rate_threshold
      following: $following
    ) {
      id
      title
      description
      likes_count
      comments_count
      avg_rating
      ratings_count
      current_user_rating
      event_type
      created_at
      has_liked
      Images {
        id
        image
      }
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

export const MAP_MARKERS = gql`
  query allEvents($type: String!, $map: Boolean) {
    allEvents(event_type: $type, display_on_map: $map) {
      id
      coordinate {
        longitude
        latitude
      }
      user {
        id
      }
    }
  }
`;

export const EVENT_QUERY = gql`
  query GetEvent($eventId: ID!) {
    getEvent(id: $eventId) {
      id
      title
      description
      event_type
      has_randomized_location
      avg_rating
      current_user_rating
      likes_count
      has_liked
      comments_count
      created_at
      Images {
        id
        image
      }
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

export const EVENT_COMMENTS = gql`
  query EventComments($eventId: ID!) {
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

// TODO: Look into fragments considering eventComments and createComment returns the same thing.
export const CREATE_COMMENT = gql`
  mutation CreateComment($eventId: ID!, $text: String!, $owner_id: ID!) {
    createComment(
      event_id: $eventId
      text: $text
      action_for_user_id: $owner_id
    ) {
      id
      text
      created_at
      comment_user {
        id
        first_name
        last_name
        profile_image
      }
      owner {
        id
        push_token
      }
    }
  }
`;

export const CREATE_VIBE = gql`
  mutation CreateVibe($desc: String!) {
    createVibe(description: $desc) {
      id
      title
      description
      likes_count
      comments_count
      avg_rating
      ratings_count
      current_user_rating
      event_type
      created_at
      has_liked
      Images {
        id
        image
      }
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

export const CREATE_MOMENT = gql`
  mutation CreateMoment(
    $description: String!
    $map: Boolean
    $random: Boolean
    $latitude: Float!
    $longitude: Float!
    $title: String!
    $image: String
    $images: [ImageInput]
    $city: String!
    $country_code: String!
    $region: String!
  ) {
    createMoment(
      description: $description
      display_on_map: $map
      has_randomized_location: $random
      latitude: $latitude
      longitude: $longitude
      title: $title
      image: $image
      images: $images
      city: $city
      country_code: $country_code
      region: $region
    ) {
      id
      title
      description
      likes_count
      image
      comments_count
      avg_rating
      ratings_count
      current_user_rating
      coordinate {
        longitude
        latitude
      }
      event_type
      created_at
      has_liked
      Images {
        id
        image
      }
      user {
        id
        first_name
        last_name
        profile_image
      }
    }
  }
`;

export const USER_SEARCH = gql`
  query AllUsers($name: String) {
    allUsers(name: $name) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const NOTIFICATIONS = gql`
  query UserNotifications($offset: Int) {
    userNotifications(offset: $offset) {
      id
      action_type
      created_at
      action_for_user_id
      action_by_user_id
      actor {
        id
        first_name
        last_name
        profile_image
      }
      event {
        id
        event_type
        Images {
          id
          image
        }
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      first_name
      last_name
      profile_image
      following_count
      followers_count
      mutual_count
      isFollowing
    }
  }
`;

export const FACEBOOK_USER = gql`
  query FacebookUser($fbId: ID!) {
    facebookUser(facebook_id: $fbId) {
      id
      first_name
      last_name
      jwt
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($first_name: String, $last_name: String, $id: ID!) {
    createUser(
      first_name: $first_name
      last_name: $last_name
      facebook_id: $id
    ) {
      id
    }
  }
`;

export const USER_FOLLOWING = gql`
  query UserFollowing($id: ID!) {
    userFollowing(id: $id) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const USER_FOLLOWERS = gql`
  query UserFollowers($id: ID!) {
    userFollowers(id: $id) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const USER_MUTUAL = gql`
  query UserMutual($id: ID!) {
    userMutual(id: $id) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const GET_EVENT_LIKES = gql`
  query EventLikes($event_id: ID!) {
    eventLikes(event_id: $event_id) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const TOGGLE_LIKE = gql`
  mutation ToggleLike($event_id: ID!, $owner_id: Int!) {
    toggleLike(event_id: $event_id, action_for_user_id: $owner_id) {
      id
      likes_count
      has_liked
      event_type
      user {
        id
        name
        push_token
      }
    }
  }
`;

export const TOGGLE_FOLLOWING = gql`
  mutation ToggleFollowing($forUserId: Int!) {
    toggleFollowing(forUserId: $forUserId) {
      id
      following_count
      followers_count
      mutual_count
      isFollowing
      push_token
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $first_name: String
    $last_name: String
    $profile_image: String
  ) {
    updateUser(
      first_name: $first_name
      last_name: $last_name
      profile_image: $profile_image
    ) {
      id
      first_name
      last_name
      profile_image
    }
  }
`;

export const SET_PUSH_TOKEN = gql`
  mutation SetPushToken($pt: String!) {
    setPushToken(push_token: $pt) {
      id
      push_token
    }
  }
`;

export const RATE_EVENT = gql`
  mutation RateEvent($event_id: ID!, $value: Int!) {
    rateEvent(event_id: $event_id, value: $value) {
      id
      avg_rating
      current_user_rating
      ratings_count
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const REPORT_EVENT = gql`
  mutation ReportEvent($event_id: ID!, $reason: String!) {
    reportEvent(event_id: $event_id, reason: $reason) {
      id
    }
  }
`;
