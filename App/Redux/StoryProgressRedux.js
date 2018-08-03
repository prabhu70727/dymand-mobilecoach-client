import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

import Common from '../Utils/Common'
// Import message actions
import { MessageActions } from './MessageRedux'
import R from 'ramda'

import Log from '../Utils/Log'
const log = new Log('Redux/StoryProgressRedux')
/* ------------- Actions and Action Creators ------------- */

const { Types, Creators } = createActions({
  handleProgressCommand: ['command'],
  visitScreen: ['visitedScreen'],
  resetVisitedScreens: [],
  addBackpackInfo: ['backpackInfoMessage']
})

export const StoryProgressActions = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  foodTutorialActive: true,
  visitedScreens: [],
  backpackActivated: false,
  diaryActivated: false,
  tourActivated: false,
  recipesActivated: false,
  actionButtonActive: false,
  backpackInfo: {}
})

/* ------------- Reducers ------------- */

export const handleProgressCommand = (state, {command, content, timestamp}) => {
  const parsedCommand = Common.parseCommand(command)
  switch (parsedCommand.command) {
    case 'complete-tutorial':
      return {
        ...state,
        foodTutorialActive: false
      }
    case 'activate-backpack':
      return {
        ...state,
        backpackActivated: true
      }
    case 'activate-recipes':
      return {
        ...state,
        recipesActivated: true
      }
    case 'activate-tour':
      return {
        ...state,
        tourActivated: true
      }
    case 'activate-diary':
      return {
        ...state,
        diaryActivated: true
      }
    case 'tracking-period-started':
      return {
        ...state,
        actionButtonActive: true
      }
    case 'tracking-period-complete':
      return {
        ...state,
        actionButtonActive: false
      }
    case 'show-backpack-info':
      const info = Common.formatInfoMessage(content, timestamp)
      let newBackpackInfo = R.clone(state.backpackInfo)
      const id = parsedCommand.value
      // Add new info under the given ID
      if (id) newBackpackInfo[id] = info
      else log.warn('Could not add BackpackInfo to Redux-Store, because no ID was defined. (Info-Title: ' + info.title + ')')
      return {
        ...state,
        backpackInfo: newBackpackInfo
      }
    default:
      return state
  }
}

export const visitScreen = (state, {visitedScreen}) => {
  let newVisitedScreens = [...state.visitedScreens]
  if (!newVisitedScreens.includes(visitedScreen)) newVisitedScreens.push(visitedScreen)
  return {
    ...state,
    visitedScreens: newVisitedScreens
  }
}

export const resetVisitedScreens = (state) => {
  return {
    ...state,
    visitedScreens: []
  }
}
/* ------------- Hookup Reducers To Actions ------------- */

// {
// type: 'COMMAND_TO_EXECUTE',
// command: 'activate-add-meal'
// }
export const reducer = createReducer(INITIAL_STATE, {
  [MessageActions.COMMAND_TO_EXECUTE]: handleProgressCommand,
  [Types.VISIT_SCREEN]: visitScreen,
  [Types.RESET_VISITED_SCREENS]: resetVisitedScreens
})
