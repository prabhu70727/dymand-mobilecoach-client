import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import Common from '../Utils/Common'
import { MessageActions } from './MessageRedux'
import Config from '../Config/AppConfig'

import Log from '../Utils/Log'
const log = new Log('Redux/TourRedux')

const TOUR_STEPS = Config.config[Config.project].tourSteps

/* ------------- Actions and Action Creators ------------- */
const { Types, Creators } = createActions({
  setTourStep: ['begin'],
  setLastSeenIndex: ['lastSeenIndex']
})

export const SettingsActions = Types
export default Creators

/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
  tourSteps: ['begin'],
  currentLastSeenIndex: 0
})

/* ------------- Reducers ------------- */
export const setTourStep = (state, {tourStep}) => {
  log.debug('Set tour step (manually):', tourStep)
  // check if this is a valid tour-step that can be animated in the animation
  if (TOUR_STEPS.includes(tourStep)) {
    log.debug('New tour step (manually):', tourStep)
    return {
      ...state,
      tourSteps: [...state.tourSteps, tourStep]
    }
  }
  log.error('Error: This is not a valid tourStep', {'tourStep': tourStep})
  return state
}

export const setLastSeenIndex = (state, {lastSeenIndex}) => {
  log.debug('Set last seen index for animation:', lastSeenIndex)
  return {
    ...state,
    currentLastSeenIndex: lastSeenIndex
  }
}

export const handleProgressCommand = (state, {command}) => {
  const parsedCommand = Common.parseCommand(command)

  switch (parsedCommand.command) {
    case 'jump-tour':
      const tourStep = parsedCommand.value
      if (TOUR_STEPS.includes(tourStep)) {
        log.debug('New tour step (by command):', tourStep)
        return {
          ...state,
          tourSteps: [...state.tourSteps, tourStep]
        }
      }
      log.warn('This is not a valid tourStep', {'tourStep': tourStep})
      return state
    default:
      return state
  }
}

/* ------------- Hookup Reducers To Actions ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_TOUR_STEP]: setTourStep,
  [Types.SET_LAST_SEEN_INDEX]: setLastSeenIndex,
  [MessageActions.COMMAND_TO_EXECUTE]: handleProgressCommand
})
