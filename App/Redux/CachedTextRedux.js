import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import update from 'immutability-helper'

import Common from '../Utils/Common'
import { MessageActions } from './MessageRedux'

const { Types, Creators } = createActions({
  cacheText: ['id', 'text']
})

export const CachedTextActions = Types
export default Creators

/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({})

export const handleCacheTextCommand = (state, {command, content}) => {
  const parsedCommand = Common.parseCommand(command)

  switch (parsedCommand.command) {
    // Add a complete day to the current trackingPeriod
    case 'cache-text':
      let id = parsedCommand.value
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
