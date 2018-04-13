import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import Log from '../Utils/Log'
const log = new Log('Redux/ServerSyncRedux')

/* ------------- Actions and Action Creators ------------- */

const { Types, Creators } = createActions({
  initialize: [], // saga
  rememberRegistration: ['deepstreamUser', 'deepstreamSecret'],
  rememberPushTokenShared: [],
  rememberLatestTimestamp: ['timestamp'],
  rememberPushToken: ['platform', 'token'],
  connectionStateChange: ['connectionState', 'deepstreamUser', 'deepstreamSecret']
})

export const ConnectionStates = { INITIALIZING: 'INITIALIZING', INITIALIZED: 'INITIALIZED', CONNECTING: 'CONNECTING', RECONNECTING: 'RECONNECTING', CONNECTED: 'CONNECTED', SYNCHRONIZATION: 'SYNCHRONIZATION', SYNCHRONIZED: 'SYNCHRONIZED' }

export const ServerSyncActions = Types
export default Creators

/* ------------- Initial State ------------- */

// Settings (stored, long-term)
export const SETTINGS_INITIAL_STATE = Immutable({
  timestamp: 0,
  registered: false,
  deepstreamUser: null,
  deepstreamSecret: null,
  restUser: null, // Must be "ds:"+user
  restToken: null,
  pushPlatform: null,
  pushToken: null,
  pushShared: false
})

// Status (not stored, current state)
export const STATUS_INITIAL_STATE = Immutable({
  connectionState: ConnectionStates.INITIALIZING
})

/* ------------- Reducers ------------- */

// Settings modification called by sagas
export const rememberRegistration = (state, action) => {
  log.debug('Remember registration')

  const { deepstreamUser, deepstreamSecret } = action
  return state.merge({ registered: true, deepstreamUser, deepstreamSecret, restUser: 'ds:' + deepstreamUser })
}

export const rememberLatestTimestamp = (state, action) => {
  log.debug('Remember latest timestamp:', action)

  const { timestamp } = action
  if (state.timestamp < timestamp) {
    return state.merge({ timestamp })
  } else {
    return state
  }
}

export const rememberPushTokenShared = (state) => {
  log.debug('Remember push token shared')

  return state.merge({ pushShared: true })
}

// Status modification called by sagas
export const connectionStateChange = (state, action) => {
  log.debug('Connection state change:', action.connectionState)

  const { connectionState } = action
  return state.merge({ connectionState })
}

// Settings modification called by notification module
export const rememberPushToken = (state, action) => {
  log.debug('Remember push token:', action)

  const { platform, token } = action

  if (state.pushToken !== null && state.pushToken !== token) {
    return state.merge({ pushPlatform: platform, pushToken: token, pushShared: false })
  } else {
    return state.merge({ pushPlatform: platform, pushToken: token })
  }
}

/* ------------- Hookup Reducers To Actions ------------- */

// Settings
export const settingsReducer = createReducer(SETTINGS_INITIAL_STATE, {
  [Types.REMEMBER_REGISTRATION]: rememberRegistration,
  [Types.REMEMBER_PUSH_TOKEN_SHARED]: rememberPushTokenShared,
  [Types.REMEMBER_LATEST_TIMESTAMP]: rememberLatestTimestamp,
  [Types.REMEMBER_PUSH_TOKEN]: rememberPushToken
})

// Status
export const statusReducer = createReducer(STATUS_INITIAL_STATE, {
  [Types.CONNECTION_STATE_CHANGE]: connectionStateChange
})
