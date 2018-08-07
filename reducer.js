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

import update from 'immutability-helper';

const initialState = {
  event: {},
  recentEvents: [],
  markers: []
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
    default:
      return state;
  }
}

export function listRecentActivity(users, coords) {
  return {
    type: GET_RECENT_ACTIVITY,
    payload: {
      request: {
        url: '/recent_events',
        method: 'GET',
        params: { users, coords }
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
        url: `/event_markers`,
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
