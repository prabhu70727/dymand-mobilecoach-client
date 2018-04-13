import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import update from 'immutability-helper'
import { MessageActions } from './MessageRedux'

const { Types, Creators } = createActions({
  cacheText: ['id', 'text']
})

export const CachedTextActions = Types
export default Creators

/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({})

export const handleCacheTextCommand = (state, {command, content}) => {
  const commandWithValue = command.split(' ')
  const onlyCommand = commandWithValue[0]
  switch (onlyCommand) {
    // Add a complete day to the current trackingPeriod
    case 'cache-text':
      let id = commandWithValue[1]
      return update(state, {
        [id]: {$set: content}
      })
    default:
      return state
  }
}

/* ------------- Hookup Reducers To Actions ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [MessageActions.COMMAND_TO_EXECUTE]: handleCacheTextCommand
})
