import gql from "graphql-tag";

export const ALL_EVENTS_QUERY = gql`
  query AllEvents($offset: Int) {
    allEvents(offset: $offset) {
      id
      title
      description
      likes_count
      image
      comments_count
      avg_rating
      current_user_rating
      event_type
      created_at
      # TODO: Need to know if current user has liked event
      user {
        id
        first_name
        last_name
        profile_image
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
  mutation CreateComment($eventId: ID!, $text: String!) {
    createComment(event_id: $eventId, text: $text) {
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

export const CREATE_VIBE = gql`
  mutation CreateVibe($desc: String!) {
    createVibe(description: $desc) {
      id
      title
      description
      likes_count
      image
      comments_count
      avg_rating
      current_user_rating
      event_type
      created_at
      # TODO: Need to know if current user has liked event
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
    $latitude: Float!
    $longitude: Float!
    $title: String!
    $image: String!
    $city: String!
    $country_code: String!
    $region: String!
  ) {
    createMoment(
      description: $description
      latitude: $latitude
      longitude: $longitude
      title: $title
      image: $image
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
      current_user_rating
      coordinate {
        longitude
        latitude
      }
      event_type
      created_at
      # TODO: Need to know if current user has liked event
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
  query allEvents($type: String!) {
    allEvents(event_type: $type) {
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
