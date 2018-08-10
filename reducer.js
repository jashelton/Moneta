export const GET_RECENT_ACTIVITY = 'moneta/events/LOAD';
export const GET_RECENT_ACTIVITY_SUCCESS = 'moneta/events/LOAD_SUCCESS';
export const GET_RECENT_ACTIVITY_FAIL = 'moneta/events/LOAD_FAIL';
export const GET_EVENT_DETAILS = 'moneta/eventDetails/LOAD';
export const GET_EVENT_DETAILS_SUCCESS = 'moneta/eventDetails/LOAD_SUCCESS';
export const GET_EVENT_DETAILS_FAIL = 'moneta/eventDetails/LOAD_FAIL';
export const UPDATE_EVENT_LIKES = 'moneta/eventDetails/UPDATE_LIKES';
export const UPDATE_EVENT_LIKES_SUCCESS = 'moneta/eventDetails/UPDATE_LIKES_SUCCESS';
export const UPDATE_EVENT_LIKES_FAIL = 'moneta/eventDetails/UPDATE_LIKES_FAIL';
export const GET_MARKERS = 'moneta/markers/GET_MARKERS';
export const GET_MARKERS_SUCCESS = 'moneta/markers/GET_MARKERS_SUCCESS';
export const GET_MARKERS_FAIL = 'moneta/markers/GET_MARKERS_FAIL';
export const DELETE_EVENT = 'moneta/events/DELETE_EVENT';
export const DELETE_EVENT_SUCCESS = 'moneta/events/DELETE_EVENT_SUCCESS';
export const DELETE_EVENT_FAIL = 'moneta/events/DELETE_EVENT_FAIL';

export const GET_USER_DETAILS = 'moneta/users/LOAD_USER_DETAILS';
export const GET_USER_DETAILS_SUCCESS = 'moneta/users/LOAD_USER_DETAILS_SUCCESS';
export const GET_USER_DETAILS_FAIL = 'moneta/users/LOAD_USER_DETAILS_FAIL';
export const GET_CURRENT_USER_DETAILS = 'moneta/users/LOAD_CURRENT_USER_DETAILS';
export const GET_CURRENT_USER_DETAILS_SUCCESS = 'moneta/users/LOAD_CURRENT_USER_DETAILS_SUCCESS';
export const GET_CURRENT_USER_DETAILS_FAIL = 'moneta/users/LOAD_CURRENT_USER_DETAILS_FAIL';
export const UPDATE_CURRENT_USER = 'moneta/users/UPDATE_CURRENT_USER';
export const UPDATE_CURRENT_USER_SUCCESS = 'moneta/users/UPDATE_CURRENT_USER_SUCCESS';
export const UPDATE_CURRENT_USER_FAIL = 'moneta/users/UPDATE_CURRENT_USER_FAIL';
export const UPDATE_USER_FOLLOWS = 'moneta/users/UPDATE_USER_FOLLOWS';
export const UPDATE_USER_FOLLOWS_SUCCESS = 'moneta/users/UPDATE_USER_FOLLOWS_SUCCESS';
export const UPDATE_USER_FOLLOWS_FAIL = 'moneta/users/UPDATE_USER_FOLLOWS_FAIL';

import update from 'immutability-helper';

const initialState = {
  event: {},
  recentEvents: [],
  markers: [],
  userDetails: {},
  currentUserDetails: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_RECENT_ACTIVITY:
      return { ...state, loading: true };
    case GET_RECENT_ACTIVITY_SUCCESS:
      return { ...state, loading: false, recentEvents: action.payload.data };
    case GET_RECENT_ACTIVITY_FAIL:
      return {
        ...state,
        loading: false,
        error: 'Error while trying to find recent events.'
      };
    case GET_EVENT_DETAILS:
      return { ...state, loading: true };
    case GET_EVENT_DETAILS_SUCCESS:
      return { ...state, loading: false, event: action.payload.data };
    case GET_EVENT_DETAILS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem getting the details for this event.'
      };
    case UPDATE_EVENT_LIKES:
      return { ...state };
    case UPDATE_EVENT_LIKES_SUCCESS:
      const { liked, likes_count } = action.payload.data;
      const updatedEvent = update(state.event, { $set: {...state.event, liked, likes_count } });
      
      return { ...state, event: updatedEvent };
    case UPDATE_EVENT_LIKES_FAIL:
      return {
        ...state,
        loading: false,
        error: 'An error occured'
      }
    case GET_MARKERS:
      return { ...state, loading: true };
    case GET_MARKERS_SUCCESS:
      return { ...state, loading: false, markers: action.payload.data }
    case GET_MARKERS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was an error retrieving the event markers.'
      };
    case DELETE_EVENT:
      return { ...state, loading: true }
    case DELETE_EVENT_SUCCESS:
      const { deleted_event } = action.payload.data;
      deleted_event = parseInt(deleted_event);
      
      return {
        ...state,
        loading: false,
        recentEvents: state.recentEvents.filter(re => re.id !== deleted_event),
        markers: state.markers.filter(m => m.id !== deleted_event)
      };
    case DELETE_EVENT_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem deleting the event.'
      }

    // Users
    case GET_USER_DETAILS:
      return { ...state, loading: true };
    case GET_USER_DETAILS_SUCCESS:
      return { ...state, loading: false, userDetails: action.payload.data };
    case GET_USER_DETAILS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was an issue getting the info for this user'
      }
    case GET_CURRENT_USER_DETAILS:
      return { ...state, loading: true };
    case GET_CURRENT_USER_DETAILS_SUCCESS:
      return { ...state, loading: false, currentUserDetails: action.payload.data };
    case GET_CURRENT_USER_DETAILS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was an issue getting the info for this user'
      }
    case UPDATE_CURRENT_USER:
      return { ...state, loading: false };
    case UPDATE_CURRENT_USER_SUCCESS:
      const updatedUser = update(state.currentUserDetails, { $set: { ...action.payload.data } })
      return { ...state, loading: false, currentUserDetails: updatedUser }
    case UPDATE_CURRENT_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem updating your profile information'
      };
    case UPDATE_USER_FOLLOWS:
      return { ...state, loading: false };
    case UPDATE_USER_FOLLOWS_SUCCESS:
      const updatedDetails = update(state.userDetails, { $set: { ...state.userDetails, ...action.payload.data } });
      return { ...state, loading: false, userDetails: updatedDetails }
    case UPDATE_USER_FOLLOWS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem handling your request.'
      }
    default:
      return state;
  }
}

// Events
export function listRecentActivity(users, coords) {
  return {
    type: GET_RECENT_ACTIVITY,
    payload: {
      request: {
        url: '/events/recent',
        method: 'GET',
        params: { users , coords }
      }
    }
  }
}

export function getEventDetails(eventId, userLocation) {
  return {
    type: GET_EVENT_DETAILS,
    payload: {
      request: {
        url: `/events/${eventId}/details`,
        method: 'GET',
        params: { userLocation }
      }
    }
  }
}

export function updateEventDetailsLikes(eventId, eventLiked) {
  return {
    type: UPDATE_EVENT_LIKES,
    payload: {
      request: {
        url:  `/events/${eventId}/like`,
        method: 'POST',
        data: { liked: !eventLiked ? 1 : 0 }
      }
    }
  }
}

export function getEventMarkers(filter) {
  return {
    type: GET_MARKERS,
    payload: {
      request: {
        url: `/events/markers`,
        method: 'GET',
        params: { filter }
      }
    }
  }
}

export function deleteEvent(eventId) {
  return {
    type: DELETE_EVENT,
    payload: {
      request: {
        url: `/events/${eventId}/delete`,
        method: 'PUT',
      }
    }
  }
}

// Users
export function getUserDetails(userId) {
  return {
    type: GET_USER_DETAILS,
    payload: {
      request: {
        url: `/users/${userId}/details`,
        method: 'GET'
      }
    }
  }
}

export function getCurrentUserDetails(userId) {
  return {
    type: GET_CURRENT_USER_DETAILS,
    payload: {
      request: {
        url: `/users/${userId}/details`,
        method: 'GET'
      }
    }
  }
}

export function updateCurrentUserDetails(user) {
  return {
    type: UPDATE_CURRENT_USER,
    payload: {
      request: {
        url: `/users/${user.id}/update`,
        method: 'PUT',
        data: { user }
      }
    }
  }
}

export function updateUserDetailsFollows(userId, isFollowing) {
  const url = `/users/${userId}/${isFollowing ? 'follow' : 'unfollow'}`;
  const method = `${isFollowing ? 'POST' : 'DELETE'}`;

  return {
    type: UPDATE_USER_FOLLOWS,
    payload: {
      request: {
        url,
        method
      }
    }
  }
}
