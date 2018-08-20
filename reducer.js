export const GET_RECENT_ACTIVITY = 'moneta/events/LOAD';
export const GET_RECENT_ACTIVITY_SUCCESS = 'moneta/events/LOAD_SUCCESS';
export const GET_RECENT_ACTIVITY_FAIL = 'moneta/events/LOAD_FAIL';
export const GET_RECENT_ACTIVITY_FOR_USER = 'moneta/events/GET_RECENT_ACTIVITY_FOR_USER';
export const GET_RECENT_ACTIVITY_FOR_USER_SUCCESS = 'moneta/events/GET_RECENT_ACTIVITY_FOR_USER_SUCCESS';
export const GET_RECENT_ACTIVITY_FOR_USER_FAIL = 'moneta/events/GET_RECENT_ACTIVITY_FOR_USER_FAIL';
export const LOAD_MORE_ROWS_FOR_USER_ACTIVITY = 'moneta/events/LOAD_MORE_ROWS_FOR_USER_ACTIVITY';
export const LOAD_MORE_ROWS_FOR_USER_ACTIVITY_SUCCESS = 'moneta/events/LOAD_MORE_ROWS_FOR_USER_ACTIVITY_SUCCESS';
export const LOAD_MORE_ROWS_FOR_USER_ACTIVITY_FAIL = 'moneta/events/LOAD_MORE_ROWS_FOR_USER_ACTIVITY_FAIL';
export const LOAD_MORE_ROWS = 'moneta/events/LOAD_MORE';
export const LOAD_MORE_ROWS_SUCCESS = 'moneta/events/LOAD_MORE_SUCCESS';
export const LOAD_MORE_ROWS_FAIL = 'moneta/events/LOAD_MORE_FAIL';
export const GET_EVENT_DETAILS = 'moneta/eventDetails/LOAD';
export const GET_EVENT_DETAILS_SUCCESS = 'moneta/eventDetails/LOAD_SUCCESS';
export const GET_EVENT_DETAILS_FAIL = 'moneta/eventDetails/LOAD_FAIL';
export const UPDATE_EVENT_LIKES = 'moneta/eventDetails/UPDATE_LIKES';
export const UPDATE_EVENT_LIKES_SUCCESS = 'moneta/eventDetails/UPDATE_LIKES_SUCCESS';
export const UPDATE_EVENT_LIKES_FAIL = 'moneta/eventDetails/UPDATE_LIKES_FAIL';
export const GET_MARKERS = 'moneta/markers/GET_MARKERS';
export const GET_MARKERS_SUCCESS = 'moneta/markers/GET_MARKERS_SUCCESS';
export const GET_MARKERS_FAIL = 'moneta/markers/GET_MARKERS_FAIL';
export const MARK_EVENT_VIEWED = 'monesta/markers/MARK_EVENT_VIEWED';
export const MARK_EVENT_VIEWED_SUCCESS = 'monesta/markers/MARK_EVENT_VIEWED_SUCCESS';
export const MARK_EVENT_VIEWED_FAIL = 'monesta/markers/MARK_EVENT_VIEWED_FAIL';
export const DELETE_EVENT = 'moneta/events/DELETE_EVENT';
export const DELETE_EVENT_SUCCESS = 'moneta/events/DELETE_EVENT_SUCCESS';
export const DELETE_EVENT_FAIL = 'moneta/events/DELETE_EVENT_FAIL';

export const GET_USER_DETAILS = 'moneta/users/LOAD_USER_DETAILS';
export const GET_USER_DETAILS_SUCCESS = 'moneta/users/LOAD_USER_DETAILS_SUCCESS';
export const GET_USER_DETAILS_FAIL = 'moneta/users/LOAD_USER_DETAILS_FAIL';
export const GET_USER_STATS = 'moneta/users/GET_USER_STATS';
export const GET_USER_STATS_SUCCESS = 'moneta/users/GET_USER_STATS_SUCCESS';
export const GET_USER_STATS_FAIL = 'moneta/users/GET_USER_STATS_FAIL';
export const GET_CURRENT_USER_DETAILS = 'moneta/users/LOAD_CURRENT_USER_DETAILS';
export const GET_CURRENT_USER_DETAILS_SUCCESS = 'moneta/users/LOAD_CURRENT_USER_DETAILS_SUCCESS';
export const GET_CURRENT_USER_DETAILS_FAIL = 'moneta/users/LOAD_CURRENT_USER_DETAILS_FAIL';
export const UPDATE_CURRENT_USER = 'moneta/users/UPDATE_CURRENT_USER';
export const UPDATE_CURRENT_USER_SUCCESS = 'moneta/users/UPDATE_CURRENT_USER_SUCCESS';
export const UPDATE_CURRENT_USER_FAIL = 'moneta/users/UPDATE_CURRENT_USER_FAIL';
export const UPDATE_USER_FOLLOWS = 'moneta/users/UPDATE_USER_FOLLOWS';
export const UPDATE_USER_FOLLOWS_SUCCESS = 'moneta/users/UPDATE_USER_FOLLOWS_SUCCESS';
export const UPDATE_USER_FOLLOWS_FAIL = 'moneta/users/UPDATE_USER_FOLLOWS_FAIL';
export const GET_RECENT_ACTIVITY_FOR_CURRENT_USER = 'moneta/users/GET_RECENT_ACTIVITY_FOR_CURRENT_USER';
export const GET_RECENT_ACTIVITY_FOR_CURRENT_USER_SUCCESS = 'moneta/users/GET_RECENT_ACTIVITY_FOR_CURRENT_USER_SUCCESS';
export const GET_RECENT_ACTIVITY_FOR_CURRENT_USER_FAIL = 'moneta/users/GET_RECENT_ACTIVITY_FOR_CURRENT_USER_FAIL';
export const GET_CURRENT_USER_STATS = 'moneta/users/GET_CURRENT_USER_STATS';
export const GET_CURRENT_USER_STATS_SUCCESS = 'moneta/users/GET_CURRENT_USER_STATS_SUCCESS';
export const GET_CURRENT_USER_STATS_FAIL = 'moneta/users/GET_CURRENT_USER_STATS_FAIL';
export const LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY = 'moneta/events/LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY';
export const LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_SUCCESS = 'moneta/events/LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_SUCCESS';
export const LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_FAIL = 'moneta/events/LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_FAIL';

import update from 'immutability-helper';

const initialState = {
  event: {},
  recentEvents: [],
  markers: [],
  userDetails: {},
  userStats: {},
  currentUserDetails: {},
  currentUserStats: {},
  userActivity: [],
  currentUserActivity: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_RECENT_ACTIVITY:
      return { ...state, loading: true };
    case GET_RECENT_ACTIVITY_SUCCESS:
      return { ...state, loading: false, recentEvents: action.payload.data.events };
    case GET_RECENT_ACTIVITY_FAIL:
      return {
        ...state,
        loading: false,
        error: 'Error while trying to find recent events.'
      };
    case GET_RECENT_ACTIVITY_FOR_USER:
      return { ...state, loading: true };
    case GET_RECENT_ACTIVITY_FOR_USER_SUCCESS:
      return { ...state, loading: false, userActivity: action.payload.data };
    case GET_RECENT_ACTIVITY_FOR_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem fetching activity for this user.'
      };
    case LOAD_MORE_ROWS_FOR_USER_ACTIVITY:
      return { ...state, loading: true };
    case LOAD_MORE_ROWS_FOR_USER_ACTIVITY_SUCCESS:
      if (action.payload.data.length) {
        const updatedUserActivity = update(state.userActivity, { $push: action.payload.data });
        return { ...state, loading: false, userActivity: updatedUserActivity};
      } else {
        return { ...state, loading: false };
      }
    case LOAD_MORE_ROWS_FOR_USER_ACTIVITY_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem loading more events for this user.'
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
    case LOAD_MORE_ROWS:
      return { ...state, loading: true };
    case LOAD_MORE_ROWS_SUCCESS:
      const updatedEvents = update(state.recentEvents, { $push: action.payload.data });
      return { ...state, loading: false, recentEvents: updatedEvents };
    case LOAD_MORE_ROWS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem trying to fetch more events.'
      }
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
    case MARK_EVENT_VIEWED:
      return { ...state, loading: false };
    case MARK_EVENT_VIEWED_SUCCESS:
      const { event_id, insertId } = action.payload.data;

      if (state.markers.length) {
        const index = state.markers.findIndex(m => m.id === parseInt(event_id));
        const updatedMarkers = update(state.markers, { [index]: { viewed_id: {$set: insertId} } });

        return { ...state, loading: false, markers: updatedMarkers };
      } else {
        return { ...state, loading: false };
      }
    case MARK_EVENT_VIEWED_FAIL:
      return {
        ...state,
        loading: false,
        error: 'Something went wrong'
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
    case GET_USER_STATS:
      return { ...state, loading: true };
    case GET_USER_STATS_SUCCESS:
      return { ...state, loading: false, userStats: action.payload.data };
    case GET_USER_STATS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was an error getting stats for this user'
      };
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
    const { userDetails } = state;
    const updatedInfo = update(userDetails, { $set: { ...userDetails, ...action.payload.data } });
      return { ...state, loading: false, userDetails: updatedInfo }
    case UPDATE_USER_FOLLOWS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem handling your request.'
      }
    case GET_RECENT_ACTIVITY_FOR_CURRENT_USER:
      return { ...state, loading: false };
    case GET_RECENT_ACTIVITY_FOR_CURRENT_USER_SUCCESS:
      return { ...state, loading: false, currentUserActivity: action.payload.data }
    case GET_RECENT_ACTIVITY_FOR_CURRENT_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem getting your recent activity.'
      }
    case GET_CURRENT_USER_STATS:
      return { ...state, loading: true };
    case GET_CURRENT_USER_STATS_SUCCESS:
      return { ...state, loading: false, currentUserStats: action.payload.data }
    case GET_CURRENT_USER_STATS_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem getting your account stats.'
      }
    case LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY:
      return { ...state, loading: true };
    case LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_SUCCESS:
      if (action.payload.data.length) {
        const updatedCurrentUserActivity = update(state.currentUserActivity, { $push: action.payload.data });
        return { ...state, loading: false, currentUserActivity: updatedCurrentUserActivity};
      } else {
        return { ...state, loading: false };
      }
    case LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY_FAIL:
      return {
        ...state,
        loading: false,
        error: 'There was a problem loading more events for this user.'
      };
    default:
      return state;
  }
}

// Events
export function listRecentActivity(users, coords, pageOffset) {
  return {
    type: GET_RECENT_ACTIVITY,
    payload: {
      request: {
        url: `/events/recent`,
        method: 'GET',
        params: { users , coords, offset: pageOffset }
      }
    }
  }
}

export function listRecentActivityForUser(id, pageOffset) {
  return {
    type: GET_RECENT_ACTIVITY_FOR_USER,
    payload: {
      request: {
        url: `/events/${id}/recent`,
        method: 'GET',
        params: { offset: pageOffset }
      }
    }
  }
}

// Current user specific for MyProfile -> Needs to be a part of the MyProfile/UserDetails refactor
export function listRecentActivityForCurrentUser(id, pageOffset) {
  return {
    type: GET_RECENT_ACTIVITY_FOR_CURRENT_USER,
    payload: {
      request: {
        url: `/events/${id}/recent`,
        method: 'GET',
        params: { offset: pageOffset }
      }
    }
  }
}

export function loadMoreRows(users, coords, pageOffset) {
  return {
    type: LOAD_MORE_ROWS,
    payload: {
      request: {
        url: `/events/recent`,
        method: 'GET',
        params: { users , coords, offset: pageOffset }
      }
    }
  }
}

export function loadMoreRowsForUserActivity(id, pageOffset) {
  return {
    type: LOAD_MORE_ROWS_FOR_USER_ACTIVITY,
    payload: {
      request: {
        url: `/events/${id}/recent`,
        method: 'GET',
        params: { offset: pageOffset }
      }
    }
  }
}

export function loadMoreRowsForCurrentUserActivity(id, pageOffset) {
  return {
    type: LOAD_MORE_ROWS_FOR_CURRENT_USER_ACTIVITY,
    payload: {
      request: {
        url: `/events/${id}/recent`,
        method: 'GET',
        params: { offset: pageOffset }
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
  const isLiked = !eventLiked ? 1 : 0;

  return {
    type: UPDATE_EVENT_LIKES,
    payload: {
      request: {
        url:  `/events/${eventId}/${isLiked ? 'like' : 'unlike'}`,
        method: `${isLiked ? 'POST' : 'DELETE'}`,
        data: { liked: isLiked}
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

export function markEventViewed(eventId) {
  return {
    type: MARK_EVENT_VIEWED,
    payload: {
      request: {
        url: `/events/${eventId}/viewed`,
        method: 'POST'
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
        url: `/users/${userId}/details/info`,
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
        url: `/users/${userId}/details/info`,
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

export function getUserStats(userId) {
  return {
    type: GET_USER_STATS,
    payload: {
      request: {
        url: `/users/${userId}/details/stats`,
        method: 'GET'
      }
    }
  }
}

// Current user specific for MyProfile -> Needs to be a part of the MyProfile/UserDetails refactor
export function getCurrentUserStats(userId) {
  return {
    type: GET_CURRENT_USER_STATS,
    payload: {
      request: {
        url: `/users/${userId}/details/stats`,
        method: 'GET'
      }
    }
  }
}