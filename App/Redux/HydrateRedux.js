import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Actions and Action Creators ------------- */
const { Types, Creators } = createActions({
  signalStorageLoaded: ['hydrationCompleted']
})

export const HydrateActions = Types
export default Creators

/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
  hydrationCompleted: false
})

/* ------------- Reducers ------------- */
export const signalStorageLoaded = (state, {hydrationCompleted}) =>
  state.merge({
    hydrationCompleted
  })

/* ------------- Hookup Reducers To Actions ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SIGNAL_STORAGE_LOADED]: signalStorageLoaded
})
