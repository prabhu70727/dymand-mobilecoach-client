import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Actions and Action Creators ------------- */

const { Types, Creators } = createActions({
  startup: [], // saga
  manuallyConnect: [], // saga
  manuallyRequestPushPermissions: [] // saga
})

export const StartupActions = Types
export default Creators

const INITIAL_STATE = Immutable({})

/* ------------- Reducers ------------- */

export const performStartup = (state, action) => {
  return state
}

/* ------------- Hookup Reducers To Actions ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.STARTUP]: performStartup
})
