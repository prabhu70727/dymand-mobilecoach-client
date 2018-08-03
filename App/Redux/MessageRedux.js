import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import R from 'ramda'

import { messageUpdateChannel } from '../Sagas/MessageSagas'

import Log from '../Utils/Log'
const log = new Log('Redux/MessageRedux')

/* ------------- Actions and Action Creators ------------- */

const { Types, Creators } = createActions({
  sendMessage: ['text', 'value', 'relatedMessageId', 'containsMedia'], // saga
  sendInvisibleMessage: ['value', 'relatedMessageId'], // saga
  sendIntention: ['text', 'intention', 'content'], // saga
  sendVariableValue: ['variable', 'value'], // saga
  addOrUpdateMessage: ['message', 'status'],
  newOrUpdatedMessageForGiftedChat: ['message'], // saga
  messageAnswered: ['messageId'],
  executeCommand: ['messageId'], // saga
  commandToExecute: ['command', 'content'],
  commandExecuted: ['messageId'],
  messageReadByGiftedChat: ['messageId'],
  messageMediaUploading: ['messageId', 'uploadPath'],
  messageFakeTimestampForGiftedChat: ['messageId', 'fakeTimestamp'],
  messageUnStickedByGiftedChat: ['messageId'],
  disableMessage: ['messageId'], // saga
  messageDisabledByGiftedChat: ['messageId']
})

export const MessageStates = { PREPARED_FOR_SENDING: 'PREPARED_FOR_SENDING', SENT: 'SENT', PROCESSED_BY_SERVER: 'PROCESSED_BY_SERVER', RECEIVED: 'RECEIVED', OPEN_QUESTION: 'OPEN_QUESTION', ANSWERED_ON_CLIENT: 'ANSWERED_ON_CLIENT', ANSWERED_AND_PROCESSED_BY_SERVER: 'ANSWERED_AND_PROCESSED_BY_SERVER', NOT_ANSWERED_AND_PROCESSED_BY_SERVER: 'NOT_ANSWERED_AND_PROCESSED_BY_SERVER', UPLOADING_MEDIA_CONTENT: 'UPLOADING_MEDIA_CONTENT' }
export const AuthorTypes = { SERVER: 'SERVER', USER: 'USER' }

export const MessageActions = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({})

/* ------------- Reducers ------------- */

// Add or update messages
export const addOrUpdateMessage = (state, { message, status }) => {
  log.debug('Add or update message...')

  const messageToStore = R.clone(message)
  let confirmationMessageToStore = null

  // Set given state (which may be adjusted later)
  messageToStore['client-status'] = status

  // Care for appropriate id
  let messageId = null

  if (messageToStore.id === undefined) {
    // Creation of client message
    messageId = 'c-' + messageToStore['user-timestamp']
  } else if (message['status'] === 'SENT_BY_USER' && state['c-' + messageToStore['user-timestamp']] !== undefined) {
    // Update of client message
    messageId = 'c-' + messageToStore['user-timestamp']
  } else {
    messageId = 's-' + messageToStore.id
  }
  messageToStore['client-id'] = messageId

  // Care for status change
  switch (messageToStore['status']) {
    case 'SENT_BY_USER':
      messageToStore['client-status'] = MessageStates.PROCESSED_BY_SERVER
      break
    case 'SENT_BY_SERVER':
      if (messageToStore['expects-answer'] === true) {
        messageToStore['client-status'] = MessageStates.OPEN_QUESTION
        log.action('Dialog', 'ReceivedQuestion', 'Timestamp', new Date())
      } else {
        log.action('Dialog', 'ReceivedMessage', 'Timestamp', new Date())
      }
      break
    case 'ANSWERED_BY_USER':
      messageToStore['client-status'] = MessageStates.ANSWERED_AND_PROCESSED_BY_SERVER
      messageToStore['sticky'] = false
      confirmationMessageToStore = R.clone(state['c-' + messageToStore['user-timestamp']])
      confirmationMessageToStore['client-status'] = MessageStates.PROCESSED_BY_SERVER
      break
    case 'NOT_ANSWERED_BY_USER':
      messageToStore['client-status'] = MessageStates.NOT_ANSWERED_AND_PROCESSED_BY_SERVER
      messageToStore['sticky'] = false
      break
  }

  // Don't allow to overwrite user-message on server reply
  switch (messageToStore['status']) {
    case 'SENT_BY_USER':
      delete messageToStore['user-message']
      break
  }

  // Fetch former message State
  const currentMessage = state[messageId]

  // Care for read status
  if (currentMessage === undefined || currentMessage['client-read'] === undefined) {
    messageToStore['client-read'] = false
  }

  // Care for author (server/user)
  if (currentMessage === undefined || currentMessage['author'] === undefined) {
    switch (messageToStore['status']) {
      case undefined:
      case 'SENT_BY_USER':
        messageToStore['author'] = AuthorTypes.USER
        break
      case 'SENT_BY_SERVER':
      case 'ANSWERED_BY_USER':
      case 'NOT_ANSWERED_BY_USER':
        messageToStore['author'] = AuthorTypes.SERVER
        break
    }
  }

  // Precalculate new merged message state
  const mergedMessageToStore = R.mergeDeepRight(state[messageId], messageToStore)

  // Check for any changes from server side (to prevent duplicate update calls to UI under specific sync conditions)
  const mergedMessageToStoreForComparision = R.clone(mergedMessageToStore)
  const originalStateForComparision = R.clone(state[messageId])

  mergedMessageToStoreForComparision['client-read'] = true
  if (originalStateForComparision !== undefined) {
    originalStateForComparision['client-read'] = true
  }

  // Only inform GUI when there are any data changes
  if (!R.equals(originalStateForComparision, mergedMessageToStoreForComparision)) {
    // Care for client version
    if (currentMessage === undefined || currentMessage['client-version'] === undefined) {
      mergedMessageToStore['client-version'] = 0
    } else {
      mergedMessageToStore['client-version'] = currentMessage['client-version'] + 1
    }

    if (mergedMessageToStore['invisible'] !== true) {
      // Inform GUI about message change
      messageUpdateChannel.put({type: MessageActions.NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT, message: mergedMessageToStore})
    }
  }

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Message is answered on client
export const messageAnswered = (state, { messageId }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'client-status': MessageStates.ANSWERED_ON_CLIENT})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Command is executed on client
export const commandExecuted = (state, { messageId }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'client-command-executed': true})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Remember that a message has been read in the GUI
export const messageReadByGiftedChat = (state, { messageId }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'client-read': true})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Remember that a message has been read in the GUI
export const messageMediaUploading = (state, { messageId, uploadPath }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'media-upload-path': uploadPath})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Remember fake timestamp used to display message in the GUI
export const messageFakeTimestampForGiftedChat = (state, { messageId, fakeTimestamp = null }) => {
  const mergedMessageToStore = R.clone(state[messageId])

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  // Adjust time of server message if it's not older than 5 minutes
  if (fakeTimestamp != null) {
    mergedMessageToStore['fake-timestamp'] = fakeTimestamp
  }

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Remember that a message has been set to unsticked in the GUI
export const messageUnStickedByGiftedChat = (state, { messageId }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'sticky': false})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}

// Mark related message as disabled when sent from GUI (e.g. disabled Buttons, Components)
export const messageDisabledByGiftedChat = (state, { messageId }) => {
  const mergedMessageToStore = R.merge(state[messageId], {'disabled': true})

  // Care for client version
  mergedMessageToStore['client-version'] = mergedMessageToStore['client-version'] + 1

  return { ...state,
    [messageId]: mergedMessageToStore
  }
}
/* ------------- Hookup Reducers To Actions ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ADD_OR_UPDATE_MESSAGE]: addOrUpdateMessage,
  [Types.MESSAGE_ANSWERED]: messageAnswered,
  [Types.COMMAND_TO_EXECUTE]: null,
  [Types.COMMAND_EXECUTED]: commandExecuted,
  [Types.MESSAGE_READ_BY_GIFTED_CHAT]: messageReadByGiftedChat,
  [Types.MESSAGE_MEDIA_UPLOADING]: messageMediaUploading,
  [Types.MESSAGE_FAKE_TIMESTAMP_FOR_GIFTED_CHAT]: messageFakeTimestampForGiftedChat,
  [Types.MESSAGE_UN_STICKED_BY_GIFTED_CHAT]: messageUnStickedByGiftedChat,
  [Types.MESSAGE_DISABLED_BY_GIFTED_CHAT]: messageDisabledByGiftedChat
})
