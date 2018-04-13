import { select, put, call, take } from 'redux-saga/effects'
import { channel, buffers } from 'redux-saga'

import { MessageActions, MessageStates } from '../Redux/MessageRedux'

import Log from '../Utils/Log'
const log = new Log('Sagas/MessageSagas')

const selectMessages = (state) => state.messages

export const MessageTypes = {PLAIN: 'PLAIN', INTENTION: 'INTENTION', VARIABLE: 'VARIABLE'}

export const messageUpdateChannel = channel(buffers.expanding())

/* --- Send message --- */
export function * sendMessage (action) {
  log.info('Send message...')
  log.action('Dialog', 'SendMessage', 'Timestamp', new Date())

  const { text, value, relatedMessageId } = action
  let messages = yield select(selectMessages)

  const message = yield call(createMessage, text, value, relatedMessageId, null, null, MessageTypes.PLAIN, false, messages)

  let relatedMessage = messages[relatedMessageId]

  if (relatedMessageId !== undefined && relatedMessageId !== null && relatedMessage !== undefined) {
    yield put({type: MessageActions.MESSAGE_ANSWERED, messageId: relatedMessageId})
    messages = yield select(selectMessages)
    relatedMessage = messages[relatedMessageId]
    messageUpdateChannel.put({type: MessageActions.NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT, message: relatedMessage})
  }

  yield put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.PREPARED_FOR_SENDING})
}

/* --- Send invisible message --- */
export function * sendInvisibleMessage (action) {
  log.info('Send invisible message...')
  log.action('Dialog', 'SendInvisibleMessage', 'Timestamp', new Date())

  const { value, relatedMessageId } = action
  let messages = yield select(selectMessages)

  const message = yield call(createMessage, null, value, relatedMessageId, null, null, MessageTypes.PLAIN, true, messages)

  let relatedMessage = messages[relatedMessageId]

  if (relatedMessageId !== undefined && relatedMessageId !== null && relatedMessage !== undefined) {
    yield put({type: MessageActions.MESSAGE_ANSWERED, messageId: relatedMessageId})
    messages = yield select(selectMessages)
    relatedMessage = messages[relatedMessageId]
    messageUpdateChannel.put({type: MessageActions.NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT, message: relatedMessage})
  }

  yield put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.PREPARED_FOR_SENDING})
}

/* --- Send intention --- */
export function * sendIntention (action) {
  log.info('Send intention...')
  log.action('Dialog', 'SendIntention', 'Timestamp', new Date())

  const { text, intention, content } = action
  const messages = yield select(selectMessages)

  let invisible = true
  if (text != null) {
    invisible = false
  }

  const message = yield call(createMessage, text, null, null, intention, (typeof content === 'string') ? content : JSON.stringify(content), MessageTypes.INTENTION, invisible, messages)

  yield put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.PREPARED_FOR_SENDING})
}

/* --- Send variable value --- */
export function * sendVariableValue (action) {
  log.info('Send intention...')
  log.action('Dialog', 'SendVariableValue', 'Timestamp', new Date())

  const { variable, value } = action
  const messages = yield select(selectMessages)

  const message = yield call(createMessage, variable, value, null, null, null, MessageTypes.VARIABLE, true, messages)

  yield put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.PREPARED_FOR_SENDING})
}

/* --- Disable message --- */
export function * disableMessage (action) {
  log.info('Disabling message...')

  const { messageId } = action
  let messages = yield select(selectMessages)

  let message = messages[messageId]

  if (messageId !== undefined && messageId !== null && message !== undefined) {
    yield put({type: MessageActions.MESSAGE_DISABLED_BY_GIFTED_CHAT, messageId: messageId})
    messages = yield select(selectMessages)
    message = messages[messageId]
    messageUpdateChannel.put({type: MessageActions.NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT, message})
  }
}

/* --- Execute command if it was not already executed --- */
export function * executeCommand (action) {
  log.info('Check command for execution...')

  const { messageId } = action

  const messages = yield select(selectMessages)
  const relatedMessage = messages[messageId]

  if (relatedMessage !== undefined) {
    if (relatedMessage['client-command-executed'] === undefined || !relatedMessage['client-command-executed']) {
      log.info('Command not executed yet, so execute it now...')
      yield put({type: MessageActions.COMMAND_TO_EXECUTE, command: relatedMessage['server-message'], content: relatedMessage['content']})
      yield put({type: MessageActions.COMMAND_EXECUTED, messageId})
    }
  }
}

/* --- Inform GUI about message changes --- */
export function * watchMessageUpdateChannel () {
  while (true) {
    const action = yield take(messageUpdateChannel)
    log.info('Message update...', action.message)
    yield put(action)
  }
}

/* --- Create a client created message in redux --- */
function createMessage (text, value, relatedMessageId, intention, content, type, invisible, messages) {
  // Create message
  let message = {}

  switch (type) {
    case MessageTypes.PLAIN:
      message['user-message'] = text
      if (value !== undefined && value !== null) {
        message['user-value'] = value
      }
      message['type'] = MessageTypes.PLAIN
      break
    case MessageTypes.INTENTION:
      message['user-intention'] = intention
      message['type'] = MessageTypes.INTENTION
      break
    case MessageTypes.VARIABLE:
      message['variable'] = text
      message['value'] = value
      message['type'] = MessageTypes.VARIABLE
      break
  }

  // Add optional message fields if necessary
  if (type === MessageTypes.PLAIN) {
    if (relatedMessageId !== null) {
      message['related-message-id'] = relatedMessageId
    }
  }

  // Add optional intention fields if necessary
  if (type === MessageTypes.INTENTION) {
    if (text !== null) {
      message['user-message'] = text
    }
    if (content !== null) {
      message['user-content'] = content
    }
  }

  // Set invisible if necessary
  message['invisible'] = invisible

  // Determine unique client timestamp
  let messageClientTimestamp = new Date().getTime()
  while (messages['c-' + messageClientTimestamp] !== undefined) {
    messageClientTimestamp++
  }
  message['user-timestamp'] = messageClientTimestamp

  return message
}
