export const GET_RECENT_ACTIVITY = 'moneta/events/LOAD';
export const GET_RECENT_ACTIVITY_SUCCESS = 'moneta/events/LOAD_SUCCESS';
export const GET_RECENT_ACTIVITY_FAIL = 'moneta/events/LOAD_FAIL';
export const GET_EVENT_DETAILS = 'moneta/eventDetails/LOAD';
export const GET_EVENT_DETAILS_SUCCESS = 'moneta/eventDetails/LOAD_SUCCESS';
export const GET_EVENT_DETAILS_FAIL = 'moneta/eventDetails/LOAD_FAIL';
export const UPDATE_EVENT_DETAILS = 'moneta/eventDetails/UPDATE';
export const UPDATE_EVENT_LIKES = 'moneta/eventDetails/UPDATE'
export const UPDATE_EVENT_LIKES_SUCCESS = 'moneta/eventDetails/UPDATE_SUCCESS'
export const UPDATE_EVENT_LIKES_FAIL = 'moneta/eventDetails/UPDATE_FAIL'

import update from 'immutability-helper';

export default function reducer(state = { events: [], event: {} }, action) {
  switch (action.type) {
    case GET_RECENT_ACTIVITY:
      return { ...state, loading: true };
    case GET_RECENT_ACTIVITY_SUCCESS:
      return { ...state, loading: false, events: action.payload.data };
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
    case UPDATE_EVENT_DETAILS:
      const newEvent = {...state.event}; // TODO: Unsure about this. Mutating state?
      return { ...state, loading: false, event: newEvent };
    default:
      return state;
    case UPDATE_EVENT_LIKES:
      return { ...state, loading: true };
    case UPDATE_EVENT_LIKES_SUCCESS:
      const { liked, likes_count } = action.payload.data;
      const updatedEvent = update(state.event, { $set: {...state.event, liked, likes_count } });
      
      return { ...state, loading: false, event: updatedEvent };
    case UPDATE_EVENT_LIKES_FAIL:
      return {
        ...state,
        loading: false,
        error: 'An error occured'
      }
  }
}

export function listRecentActivity(data) {
  return {
    type: GET_RECENT_ACTIVITY,
    payload: {
      request: {
        url: '/'
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

export function updateEventDetails(event) {
  return {
    type: UPDATE_EVENT_DETAILS,
    payload: {
      data: event
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
