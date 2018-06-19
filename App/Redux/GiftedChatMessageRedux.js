import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import R from 'ramda'

import {MessageStates} from '../Redux/MessageRedux'

/* ------------- Actions and Action Creators ------------- */

/* Redux-Sauce automatically creates actions according to the following scheme:
 * loginRequest: ['username', 'password'] =>
 * (username, password) => {
 *    type: LOGIN_REQUEST
 *    username: username,
 *    password: password
 *  }
 */

const { Types, Creators } = createActions({
  // This action will directly add or update the new message in the redux-store
  giftedChatAddMessage: ['message', 'addToStart'],
  // Update giftedchat messages relating to the given server message
  giftedChatUpdateMessages: ['serverMessage'],
  // This action can be invoked externally (e.g. from components)
  giftedChatHandleNewOrUpdatedMessages: ['messages'],
  // This action can be invoked externally (e.g. from components)
  setMessageAnimationFlag: ['messageId', 'value']
})

export const GiftedChatMessageActions = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({})

/* ------------- Reducers ------------- */

// add new messages
export const giftedChatAddMessage = (state, { message, addToStart = false }) => {
  // This will either add the new message to the state
  // or update the old version of an exisitng message by using recursive deepmerge
  if (addToStart) {
    return {
      [message._id]: R.mergeDeepRight(state[message._id], message),
      ...state
    }
  } else {
    return {
      ...state,
      [message._id]: R.mergeDeepRight(state[message._id], message)
    }
  }
}

// update wether a message should be animated or not
export const setMessageAnimationFlag = (state, { messageId, value }) => {
  let updatedMessage = R.clone(state[messageId])
  updatedMessage.custom['shouldAnimate'] = value
  return {
    ...state,
    [messageId]: updatedMessage
  }
}

// update GiftedChat Messages relating to the given server message
export const giftedChatUpdateMessages = (state, { serverMessage }) => {
  let updatedMessages = {}
  let subId = 0
  let messageId = serverMessage['client-id']
  messageId = messageId + '-' + subId++
  while (state[messageId]) {
    const oldMsg = state[messageId]

    // update the relevant fields
    let newMsg = {}
    newMsg['custom'] = {
      clientVersion: serverMessage['client-version'],
      clientStatus: serverMessage['client-status'],
      disabled: serverMessage['disabled'],
      sticky: serverMessage['sticky']
    }

    // If message is answered don't render it (anymore)
    if (oldMsg.type !== 'text' && (serverMessage['client-status'] === MessageStates.ANSWERED_ON_CLIENT || serverMessage['client-status'] === MessageStates.ANSWERED_AND_PROCESSED_BY_SERVER)) {
      newMsg['custom'] = {
        ...newMsg['custom'],
        visible: false
      }
    }

    // If message is not answered render it differently
    if (oldMsg.type !== 'text' && serverMessage['client-status'] === MessageStates.NOT_ANSWERED_AND_PROCESSED_BY_SERVER) {
      newMsg['custom'] = {
        ...newMsg['custom'],
        unanswered: true
      }
    }

    // gather all updated messages in one object
    updatedMessages[messageId] = newMsg
    // increase subId
    messageId = serverMessage['client-id']
    messageId = messageId + '-' + subId++
  }
  // Merge old state with updated messages
  return R.mergeDeepRight(state, updatedMessages)
}

/* ------------- Hookup Reducers To Actions ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.GIFTED_CHAT_ADD_MESSAGE]: giftedChatAddMessage,
  [Types.GIFTED_CHAT_UPDATE_MESSAGES]: giftedChatUpdateMessages,
  [Types.SET_MESSAGE_ANIMATION_FLAG]: setMessageAnimationFlag
})
