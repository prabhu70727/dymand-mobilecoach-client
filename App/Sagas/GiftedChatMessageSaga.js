import { delay } from 'redux-saga'
import { take, call, put, select, fork } from 'redux-saga/effects'
import R from 'ramda'

import Common from '../Utils/Common'
// Import Reducers / Actions for Chat Messages
import { GiftedChatMessageActions } from '../Redux/GiftedChatMessageRedux'
import { MessageActions, AuthorTypes, MessageStates } from '../Redux/MessageRedux'
// Import Reducers / Actions for Chat Messages
import { GUIActions } from '../Redux/GUIRedux'
// import { StoryProgressActions } from '../Redux/StoryProgressRedux'
import AppConfig from '../Config/AppConfig'

import Log from '../Utils/Log'
const log = new Log('Sagas/GiftedChatMessageSaga')

//Import forground service for natice code
import ForegroundServiceModule from '../Containers/Interfaces/ForegroundServiceModule'
import DymandFGServiceModule from '../Containers/Interfaces/DymandFGServiceModule'
import AffectiveSliderModule from '../Containers/SelfReport/AffectiveSliderModule'
import BackgroundVideoRecordingModule from '../Containers/SelfReport/BackgroundVideoRecordingModule'
import SelfReportDymandModule from '../Containers/SelfReport/SelfReportDymandModule'
import { PermissionsAndroid } from 'react-native'

let oldestShownMessage = -1

// selectors
const allMessages = (state) => state.messages
let addedHistoricalMessages = []
// const getNumberOfMessages = (state) => Object.keys(state.messages).length
// const getNumberOfShownMessages = state => state.guistate.numberOfShownMessages
export function * initializeGiftedChat ({buffer, newOrUpdatedMessagesChannel}, action) {
  log.info('Initializing gifted chat...')
  yield call(loadEarlierMessages)

  log.info('Starting to watch for new or updated messages...')
  yield fork(watchNewOrUpdatedMessageForGiftedChat, {buffer, newOrUpdatedMessagesChannel})
}

// This saga watches for new messages from the server which will always dispatched with type "NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT"
export function * watchNewOrUpdatedMessageForGiftedChat ({buffer, newOrUpdatedMessagesChannel}, action) {
  while (true) {
    const { message } = yield take(newOrUpdatedMessagesChannel)
    log.debug('New or updated message:', message)

    // Check if we already have a version of this message
    let guiClientVersion = yield call(getClientVersionOfGuiMessage, message['client-id'])

    // If we have a message with this client-id already...
    if (guiClientVersion !== null) {
      if (guiClientVersion < message['client-version']) {
        // Update the messages immediately
        yield put({ type: GiftedChatMessageActions.GIFTED_CHAT_UPDATE_MESSAGES, serverMessage: message })
      }
    // If its a new message, add it with some typing-delay
    } else {
      let fakeTimestamp = null

      // Mark message as read
      if (!message['client-read']) {
        fakeTimestamp = yield call(checkForDelayedPresentation, message)

        yield put({ type: MessageActions.MESSAGE_FAKE_TIMESTAMP_FOR_GIFTED_CHAT, messageId: message['client-id'], fakeTimestamp })
      }
      // Convert the servermessage to giftedchat-format
      let giftedChatMessages = parseServerMessage(message, fakeTimestamp)

      // Messages with faked timestamps should be shown with typing delay, others not
      if (fakeTimestamp == null) {
        yield call(addMessages, giftedChatMessages)
      } else {
        yield call(addMessagesWithDelay, giftedChatMessages)
      }
    }

    // Inform GUI state if another message is expected
    if (buffer.isEmpty()) {
      yield put({ type: GUIActions.SET_CURRENTLY_FURTHER_MESSAGES_EXPECTED, currentlyFurtherMessagesExpected: false })
    } else {
      yield put({ type: GUIActions.SET_CURRENTLY_FURTHER_MESSAGES_EXPECTED, currentlyFurtherMessagesExpected: true })
    }
  }
}

export function * loadEarlierMessages () {
  log.debug('Loading earlier messages...')

  const messages = yield select(allMessages)

  if (messages === undefined || messages === null) {
    return
  }

  let messagesKeys = Object.keys(messages)

  let minimalMessagesToLoad = 0
  let messageToStart = 0
  let startup
  if (oldestShownMessage === -1) {
    log.debug('Startup case...')
    startup = true
    minimalMessagesToLoad = AppConfig.config.messages.initialNumberOfMinimalShownMessages
    messageToStart = messagesKeys.length - 1
  } else {
    log.debug('Load earlier case...')
    startup = false
    minimalMessagesToLoad = AppConfig.config.messages.incrementShownMessagesBy
    messageToStart = oldestShownMessage - 1
  }

  log.debug('Load at least ', minimalMessagesToLoad, ' messages starting with ', messageToStart)

  let commandsToCheck = []
  let addedMessages = 0
  let onlyStickyMessages = false
  for (let i = messageToStart; i >= 0; i--) {
    const messageToAdd = { ...messages[messagesKeys[i]] }
    let giftedChatMessages = parseServerMessage(messageToAdd)

    // Cancel if already shown enough messages
    if (addedMessages >= minimalMessagesToLoad && messageToAdd['client-read']) {
      onlyStickyMessages = true
    }

    if (startup) {
      // Remember commands
      if ((typeof messageToAdd['client-command-executed'] === 'undefined' || messageToAdd['client-command-executed'] === false) && giftedChatMessages.length >= 1 && giftedChatMessages[0].type === 'hidden-command') {
        commandsToCheck.unshift(giftedChatMessages[0])
      }
    }

    if (!onlyStickyMessages) {
      // Remeber oldest shown message
      oldestShownMessage = i

      // Remember real number of already added messages
      for (const giftedChatMessage of giftedChatMessages) {
        if (giftedChatMessage.custom.visible) {
          addedMessages++
        }
      }
    }

    const giftedChatMessagesReversed = giftedChatMessages.reverse()
    // Add message
    for (const giftedChatMessage of giftedChatMessagesReversed) {
      if (!onlyStickyMessages || (onlyStickyMessages && giftedChatMessage.custom.sticky)) {
        if (!addedHistoricalMessages.includes(giftedChatMessage._id)) {
          log.debug('Adding message ', giftedChatMessage._id)
          addedHistoricalMessages.push(giftedChatMessage._id)
          yield call(addMessages, [giftedChatMessage], true)
        }
      }
    }
  }

  // Execute commands
  for (const commandMessage of commandsToCheck) {
    yield put({ type: MessageActions.EXECUTE_COMMAND, messageId: commandMessage._id.substring(0, commandMessage._id.lastIndexOf('-')) })
  }

  // Show or hide load earlier button
  if (oldestShownMessage <= 0) {
    oldestShownMessage = 0
    yield put({ type: GUIActions.HIDE_LOAD_EARLIER })
  } else {
    yield put({ type: GUIActions.SHOW_LOAD_EARLIER })
  }
}

function * checkForDelayedPresentation (message) {
  // Server message should have a fake timestamp if never than 5 minutes
  if (message['author'] === 'SERVER') {
    const now = Date.now()
    const messageTimestamp = message['message-timestamp'] * 1

    if ((messageTimestamp + 300000) > now) {
      return now
    }
  }

  return null
}

// Returns the client-version of a message in the current giftedchat-store with the given client-id
// or 'undefined' if there is currently no message with the given id
function * getClientVersionOfGuiMessage (messageId) {
  // define selector
  const getMessageById = (state) => {
    // if there is a corresponding giftedChat message, there will always be the first subId = '-0'
    let message = state.giftedchatmessages[messageId + '-0']
    return message
  }
  // use selector to filter state
  let message = yield select(getMessageById)
  // If the message was found
  if (message) {
    return message.custom.clientVersion
  // else return undefined
  } else {
    return null
  }
}

// Add messages to giftedChat immediately
function * addMessages (messages = [], addToStart = false) {
  for (let i = 0; i < messages.length; i++) {
    let message = { ...messages[i] }

    // Fire commands (only for newly added messages, not for load earlier messages)
    if (!addToStart && message.type === 'hidden-command') {
      yield put({ type: MessageActions.EXECUTE_COMMAND, messageId: message._id.substring(0, message._id.lastIndexOf('-')) })
    }

    // Remember message as read
    yield put({ type: MessageActions.MESSAGE_READ_BY_GIFTED_CHAT, messageId: message._id.substring(0, message._id.lastIndexOf('-')) })

    yield put({ type: GiftedChatMessageActions.GIFTED_CHAT_ADD_MESSAGE, message, addToStart })
  }
}

// Add messages to giftedChat with a proper human typing delay (typing indicator will be shown)
function * addMessagesWithDelay (messages = []) {
  const { fastMode, interactiveElementDelay } = AppConfig.config.typingIndicator

  for (let i = 0; i < messages.length; i++) {
    let message = { ...messages[i] }

    // set animation flag (messages with animations, e.g. input-options should only animate once..)
    message.custom['shouldAnimate'] = true

    // Care for special flow-related commandsToCheck
    if (message.type === 'hidden-command') {
      const parsedCommand = Common.parseCommand(message.text)

      switch (parsedCommand.command) {
        // Wait Command
        case 'wait':
          if (fastMode) {
            yield delay(50)
          } else {
            yield delay(parsedCommand.value * 1000)
          }
          log.debug('Waiting', parsedCommand.value * 1000, 'seconds')
          break
      }
    }

    // Fire commands
    if (message.type === 'hidden-command') {
      yield put({ type: MessageActions.EXECUTE_COMMAND, messageId: message._id.substring(0, message._id.lastIndexOf('-')) })
    }

    // Remember message as read
    yield put({ type: MessageActions.MESSAGE_READ_BY_GIFTED_CHAT, messageId: message._id.substring(0, message._id.lastIndexOf('-')) })

    // If the message is sent from coach and no command...
    if (message.user._id === 2 && message.type !== 'hidden-command') {
      // ...and it's a Text Message, add a typing delay from Coach ;)
      let ms = 0
      if (message.type === 'text' && message.custom.visible) {
        yield put({ type: GUIActions.SHOW_COACH_IS_TYPING })
        ms = calculateMessageDelay(message)
        // Attention: timers higher than 1000 ms don't work properly with chrome debugger (see: https://github.com/facebook/react-native/issues/9436)
        if (fastMode) {
          yield delay(50)
        } else {
          yield delay(Math.floor(ms / 5 * 4))
        }
        yield put({ type: GUIActions.HIDE_COACH_IS_TYPING })
      } else {
        if (fastMode) {
          yield delay(50)
        } else {
          yield delay(interactiveElementDelay)
        }
      }
      // Add message to chat
      yield put({ type: GiftedChatMessageActions.GIFTED_CHAT_ADD_MESSAGE, message })

      // Wait again for a while (if ms have been calculated)
      if (fastMode) {
        yield delay(50)
      } else {
        yield delay(Math.floor(ms / 5))
      }

    // If it's a message from user, a system message or a hidden command, add it directly
    } else {
      // Add message to chat
      yield put({ type: GiftedChatMessageActions.GIFTED_CHAT_ADD_MESSAGE, message })
    }
  }
}

// Function to determine a proper "human" delay for typing a Message
function calculateMessageDelay (message) {
  // Typing speed of our Coach
  let wordsPerMinute = AppConfig.config.typingIndicator.coachTypingSpeed
  let charPerMinute = wordsPerMinute * 5
  // avg seconds per character
  let sPerChar = 1 / (charPerMinute / 60)
  // milliseconds
  let ms = sPerChar * message.text.length * 1000
  // Max delay
  if (ms > AppConfig.config.typingIndicator.maxTypingDelay) ms = AppConfig.config.typingIndicator.maxTypingDelay
  log.debug('Calculated message delay is ', ms / 1000, ' seconds')
  return ms
}

function parseServerMessage (serverMessage, fakeTimestamp = null) {
  try {
    let giftedChatMessages = convertServerMessageToGiftedChatMessages(serverMessage, fakeTimestamp)
    return giftedChatMessages
  } catch (error) {
    log.error('Error: Failed to convert Server-Message to GiftedChat-Message:', error.toString())
    return []
  }
}

function convertServerMessageToGiftedChatMessages (serverMessage, fakeTimestamp = null) {
  // Actively ignore specific types
  if (serverMessage.type === 'VARIABLE') {
    return []
  }

  // since some servermessages need to be split into several givtedChat messages, we will return an array
  let messages = []
  // add a sub-id to the gitedchat messages
  let subId = 0

  // We need to convert our server messages into GiftedChat messages
  let message = {
    _id: serverMessage['client-id'] + '-' + subId++,
    custom: {
      clientVersion: serverMessage['client-version'],
      clientStatus: serverMessage['client-status'],
      linkedMedia: serverMessage['contains-media'],
      mediaType: serverMessage['media-type'],
      linkedSurvey: serverMessage['contains-survey'],
      sticky: serverMessage['sticky'],
      disabled: serverMessage['disabled'],
      visible: true,
      unanswered: false
    }
  }

  switch (serverMessage.author) {
    // Message from server
    case AuthorTypes.SERVER:
      message.text = serverMessage['server-message']

      if (fakeTimestamp != null) {
        message.createdAt = fakeTimestamp
      } else if (serverMessage['fake-timestamp'] !== undefined) {
        message.createdAt = serverMessage['fake-timestamp']
      } else {
        message.createdAt = serverMessage['message-timestamp']
      }
      message.user = {
        _id: 2
      }
      break
    // Message from user
    case AuthorTypes.USER:
      message.text = serverMessage['user-message']
      message.createdAt = serverMessage['user-timestamp']
      message.user = {
        _id: 1
      }
      break
    default: {}
  }

  // convention: If the serverMessage contains media, but the text doesn't include a link to it, add a the media as a new bubble at the bottom of the message
  if (serverMessage['contains-media'] && !message.text.includes('####LINKED_MEDIA_OBJECT####')) {
    // if the message is empty, completely replace it to prevent the empty bubble
    if (message.text === '') message.text = '####LINKED_MEDIA_OBJECT####'
    // otherwise, add it to the bottom
    else message.text = message.text + '\n---\n####LINKED_MEDIA_OBJECT####'
  }

  // ...same convention for linked surveys
  if (serverMessage['contains-survey'] && !message.text.includes('####LINKED_SURVEY####')) {
    // if the message is empty, completely replace it to prevent the empty bubble
    if (message.text === '') message.text = '####LINKED_SURVEY####'
    else message.text = message.text + '\n---\n####LINKED_SURVEY####'
  }

  // Check which kind of Message was recieved and handle it accordingly
  switch (serverMessage.type) {
    // Plain text message
    // User intention
    case 'INTENTION': {
      message.type = 'intention'
      messages.push(message)
      break
    }
    case 'PLAIN': {
      // first create an array, so the following forEach loop will be called at least one time
      let subMessages = [message.text]
      // this is just to prevent errors in case the message contains no text (e.g. plain image)
      if (message.text) {
        // if there is text, split the message to several bubbles (seperated by "---")
        subMessages = message.text.split('\n---\n')
      }
      subId = 0
      subMessages.forEach(subMessage => {
        let newMessage = R.clone(message)
        newMessage.text = subMessage.trim()
        newMessage.type = 'text'
        newMessage._id = serverMessage['client-id'] + '-' + subId++
        messages.push(newMessage)
      })
      break
    }
    // Server Command
    case 'COMMAND': {
      // in a command message, the server-message field contains the command type
      const parsedCommand = Common.parseCommand(serverMessage['server-message'])

      switch (parsedCommand.command) {

        case 'remind-user-self-report':
          DymandFGServiceModule.notifyUserAboutSelfReport()
          message.type = 'hidden-command'
          break

        case 'get-timed-wake-lock-min-close-webview':
          DymandFGServiceModule.timedWakeLockAndCloseWebView(parsedCommand.value)
          message.type = 'hidden-command'
          break

        case 'send-time-config-dymand':
          DymandFGServiceModule.sendConfig("sendConfig")
          break


        case 'send-hasStartedSelfReportSignal':
          DymandFGServiceModule.sendHasStartedSelfReportSignal()
          message.type = 'hidden-command'
          break

        case 'send-selfReportCompletedSignal':
          DymandFGServiceModule.sendSelfReportCompletedSignal()
          message.type = 'hidden-command'
          break 

        case 'show-self-report-dymand':
          SelfReportDymandModule.show()
          message.type = 'hidden-command'
          break


        // hidden video recording
        case 'hidden-video-recording':
          BackgroundVideoRecordingModule.recordFrontCamera(parsedCommand.value)
          break

        // show the slider
        case 'show-affective-slider':
          AffectiveSliderModule.showSlider()
          break

        // start intervention command
        case 'start-intervention':
          ForegroundServiceModule.stopInitialService()
          ForegroundServiceModule.startInterventionService()
          break
        
        case 'stop-intervention':
          ForegroundServiceModule.stopInterventionService()
          ForegroundServiceModule.startInitialService()
          break

        // Show Info Command
        case 'show-backpack-info':
        case 'show-info': {
          message.type = 'open-component'
          // Default title
          let buttonTitle = ''
          let content = serverMessage.content  // .replace(/\n/g, '')
          // Button Title is delivered in message-Field
          const pattern = new RegExp('<button>(.*)</button>', 'g')
          const regExpResult = pattern.exec(content)
          if (regExpResult) {
            buttonTitle = regExpResult[1]
            content = content.replace(regExpResult[0], '')
          }
          message.custom = {
            ...message.custom,
            // Info-Content delievered by server in DS-Message
            content,
            // Component to be opened on Tap
            component: 'rich-text',
            infoId: parsedCommand.value,
            buttonTitle: buttonTitle
          }
          // Only remember backpack infos
          if (parsedCommand.command === 'show-backpack-info') {
            if (parsedCommand.value === null) log.warn('Received show-backpack-info without id! Command: ' + serverMessage['server-message'])
            else {
              // Add a separate message to execute addInfoCommand
              let addInfoCommandMessage = R.clone(message)
              // No need to double store content because it will be loaded from serverMessage using the related-id
              addInfoCommandMessage.content = ''
              addInfoCommandMessage.type = 'hidden-command'
              addInfoCommandMessage._id = serverMessage['client-id'] + '-' + subId++
              messages.push(addInfoCommandMessage)

              message.custom.component = 'backpack-info'
              message.custom.content = parsedCommand.value
            }
          }
          break
        }
        // Show Web Command
        case 'show-web': {
          message.type = 'open-component'
          message.custom = {
            ...message.custom,
            // Info-Content delievered by server in DS-Message
            content: parsedCommand.value,
            // Component to be opened on Tap
            component: 'web',
            buttonTitle: parsedCommand.contentWithoutFirstValue,
            infoId: parsedCommand.value
          }
          break
        }
        // Show Tour Command
        case 'show-tour': {
          message.type = 'open-component'
          message.custom = {
            ...message.custom,
            // Component to be opened on Tap
            component: 'tour',
            buttonTitle: parsedCommand.content
          }
          break
        }
        // Show Backpack Command
        case 'show-backpack': {
          message.type = 'open-component'
          message.custom = {
            ...message.custom,
            // Component to be opened on Tap
            component: 'backpack',
            buttonTitle: parsedCommand.content
          }
          break
        }
        // Show Backpack Command
        case 'show-diary': {
          message.type = 'open-component'
          message.custom = {
            ...message.custom,
            // Component to be opened on Tap
            component: 'diary',
            buttonTitle: parsedCommand.content
          }
          break
        }
        // Show Backpack Command
        case 'show-pyramid': {
          message.type = 'open-component'
          message.custom = {
            ...message.custom,
            // Component to be opened on Tap
            component: 'pyramid',
            buttonTitle: parsedCommand.content
          }
          break
        }
        // Other command not related to chat
        default:
          message.type = 'hidden-command'
          break
      }
      messages.push(message)
      break
    }
    default:
      log.warn('Received Deepstream Message with type: ' + serverMessage.type + ', but was ignored by ChatScreenComponent.')
      messages.push(message)
  }

  // Check if there should be any answer inputs displayed
  if (serverMessage['expects-answer']) {
    // Create Answer Message
    let inputMessage = {
      _id: serverMessage['client-id'] + '-' + subId++,
      user: {
        _id: 1
      },
      custom: {
        clientVersion: serverMessage['client-version'],
        clientStatus: serverMessage['client-status'],
        sticky: serverMessage['sticky'],
        uploadPath: serverMessage['media-upload-path'],
        visible: true,
        unanswered: false
      }
    }
    // Check if there is an answer format
    if (serverMessage['answer-format']) {
      const { type, options } = serverMessage['answer-format']
      // Check the expected answer format
      switch (type) {
        case 'select-one': {
          inputMessage.type = 'select-one-button'
          let answers = []
          for (let i = 0; i < options.length; i++) {
            answers.push({
              button: options[i][0],
              value: options[i][1]
            })
          }
          inputMessage.custom = {
            ...inputMessage.custom,
            intention: 'answer-to-server-visible',
            selected: null,
            options: answers
          }
          break
        }
        case 'select-many': {
          inputMessage.type = 'select-many'
          let answers = []
          for (let j = 0; j < options.length; j++) {
            answers.push({
              label: options[j][0],
              value: options[j][1]
            })
          }
          inputMessage.custom = {
            ...inputMessage.custom,
            intention: 'answer-to-server-visible',
            options: answers
          }
          break
        }
        case 'free-text':
        case 'free-text-multiline':
        case 'free-numbers':
          {
            let multiline = false
            let onlyNumbers = false
            let placeholder = null
            let textBefore = null
            let textAfter = null

            // Different types
            if (type === 'free-text') {
              inputMessage.type = 'free-text'
            } else if (type === 'free-text-multiline') {
              inputMessage.type = 'free-text'
              multiline = true
            } else if (type === 'free-numbers') {
              inputMessage.type = 'free-numbers'
              onlyNumbers = true
            }

            // Determine appropriate placeholders
            let placeholderText = ''
            if (options) placeholderText = options

            if (options.includes('_')) {
              let splitText = placeholderText.split(('_'), 2)
              if (splitText[0]) textBefore = splitText[0]
              if (splitText[1]) textAfter = splitText[1]
            } else if (placeholderText !== '') {
              placeholder = placeholderText
            }

            inputMessage.custom = {
              ...inputMessage.custom,
              intention: 'answer-to-server-visible',
              multiline,
              onlyNumbers,
              placeholder,
              textBefore,
              textAfter
            }
            break
          }
        case 'date':
        case 'time':
        case 'date-and-time': {
          inputMessage.type = 'date-input'
          let mode = 'datetime'
          if (type === 'date') mode = 'date'
          if (type === 'time') mode = 'time'
          let defaultOptions = {
            mode,
            placeholder: '',
            min: null,
            max: null
          }
          if (options && options.length > 0 && options[0][0]) defaultOptions.placeholder = options[0][0]
          if (options) {
            for (let j = 0; j < options.length; j++) {
              if (options[j][0] === 'min') {
                defaultOptions.min = options[j][1]
              } else if (options[j][0] === 'max') {
                defaultOptions.max = options[j][1]
              }
            }
          }
          inputMessage.custom = {
            ...inputMessage.custom,
            ...defaultOptions,
            intention: 'answer-to-server-visible'
          }
          break
        }
        case 'likert':
        case 'likert-silent':
        case 'likert-slider':
        case 'likert-silent-slider': {
          inputMessage.type = type
          let defaultOptions = {
            answers: [],
            silent: false
          }
          if (type === 'likert-silent' || type === 'likert-silent-slider') {
            defaultOptions.silent = true
          }
          if (options) {
            for (let j = 0; j < options.length; j++) {
              defaultOptions.answers.push({
                label: options[j][0],
                value: options[j][1]
              })
            }
          }
          inputMessage.custom = {
            ...inputMessage.custom,
            intention: 'answer-to-server-visible',
            options: defaultOptions
          }
          break
        }
        case 'image':
        case 'audio':
        case 'video': {
          inputMessage.type = type
          if (options) {
            for (let j = 0; j < options.length; j++) {
              if (options[j][0] === 'variable') {
                inputMessage.custom = {
                  ...inputMessage.custom,
                  uploadVariable: options[j][1]
                }
              }
            }
          }
        }
      }
      messages.push(inputMessage)
      // Free-Text answer...
    } else {
      // Not implemented yet
    }
  }

  // Check for visibility-status
  messages.forEach((message) => {
    // Never render user-messages without text
    if (message.type === 'text' && message.text === '') {
      message.custom.visible = false
    }
    // Never render intentions without text => fancy ES6 syntax! :)
    if (message.type === 'intention' && ['', null, undefined].includes(message.text)) {
      message.custom.visible = false
    }
    // Never render hidden commands
    if (message.type === 'hidden-command') {
      message.custom.visible = false
    }
    // If message is answered don't render it
    if (message.type !== 'text' && (serverMessage['client-status'] === MessageStates.ANSWERED_ON_CLIENT || serverMessage['client-status'] === MessageStates.ANSWERED_AND_PROCESSED_BY_SERVER)) {
      message.custom.visible = false
    }
    // If message is not answered render it differently
    if (message.type !== 'text' && serverMessage['client-status'] === MessageStates.NOT_ANSWERED_AND_PROCESSED_BY_SERVER) {
      message.custom.unanswered = true
    }
  })
  return messages
}
