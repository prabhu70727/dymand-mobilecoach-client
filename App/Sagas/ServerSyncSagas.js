import { NetInfo, Platform } from 'react-native'
import { call, select, put, take } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import createDeepstream from 'deepstream.io-client-js'

import Common from '../Utils/Common'
import AppConfig from '../Config/AppConfig'
import { StartupActions } from '../Redux/StartupRedux'
import { ServerSyncActions, ConnectionStates } from '../Redux/ServerSyncRedux'
import { MessageStates, MessageActions } from '../Redux/MessageRedux'
import { MessageTypes } from '../Sagas/MessageSagas'
import PushNotifications from '../Utils/PushNotifications'

import Log from '../Utils/Log'
const log = new Log('Sagas/ServerSyncSagas')

const selectServerSyncSettings = (state) => state.serverSyncSettings
const selectMessages = (state) => state.messages

const serverSyncConfig = AppConfig.config.serverSync

const fakeDeviceAlwaysOnlineForOfflineDev = AppConfig.config.dev.fakeDeviceAlwaysOnlineForOfflineDev

const createSyncClient = createDeepstream

let initialized = false

let syncClient = null

let online = false

let firstConnectSuccessful = false
let listenersRegistered = false
let inSync = false

let serverSyncUser = null

let connectionStateChannel = null
let incomingMessageChannel = null
let outgoingMessageChannel = null

/* --- Set channels from outside --- */
export function setChannels (newConnectionStateChannel, newIncomingMessageChannel, newOutgoingMessageChannel) {
  log.debug('Setting serverSync channels.')
  connectionStateChannel = newConnectionStateChannel
  incomingMessageChannel = newIncomingMessageChannel
  outgoingMessageChannel = newOutgoingMessageChannel
}

/* --- Register user on server --- */
export function * initializeServerSync (action) {
  const preInitSettings = yield select(selectServerSyncSettings)
  if (action.type === StartupActions.STARTUP && !AppConfig.config.startup.automaticallyConnectOnFirstStartup && (preInitSettings.deepstreamUser == null || preInitSettings.deepstreamSecret == null)) {
    log.info('Server sync is not starting up automatically.')
    return
  }

  if (initialized) {
    return
  }
  log.info('Initializing server sync...')
  initialized = true

  log.debug('Care for prepared messages...')
  const allMessages = yield select(selectMessages)

  yield call(sendPreparedMessages, allMessages)

  log.debug('Care for connection status of device...')

  // START of workaround for problems with network connection state on some android devices
  const onInitialNetConnection = isConnected => {
    NetInfo.isConnected.removeEventListener(
          onInitialNetConnection
      )
  }

  NetInfo.isConnected.addEventListener(
      'connectionChange',
      onInitialNetConnection
  )
  // END of workaround

  yield NetInfo.isConnected.fetch().then(isConnected => {
    handleDeviceConnectivity(isConnected)
  })
  NetInfo.isConnected.addEventListener(
    'connectionChange',
    handleDeviceConnectivity
  )

  let settings = yield select(selectServerSyncSettings)

  // User is not registered, yet
  log.debug('Care for user registration...')

  if (settings.registered === true) {
    log.debug('User already registered.')
    serverSyncUser = settings.deepstreamUser
    PushNotifications.getInstance().setEncryptionKey(('ds:' + serverSyncUser).substring(0, 16), serverSyncUser.substring(serverSyncUser.length - 16))
    log.setUser(serverSyncUser)
  } else {
    log.debug('User not registered, so it will be done implicitely on connect')
  }

  // Check success of manual push notification request
  yield call(checkPushNotificationsRequested)

  connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.INITIALIZED})
}

/* --- Handle special commands --- */
export function * handleCommands (action) {
  const {command} = action

  const parsedCommand = Common.parseCommand(command)

  switch (parsedCommand.command) {
    // Manually request push permissions
    case 'request-push-permissions':
      log.debug('Manually requesting push permissions...')
      yield put({type: ServerSyncActions.REMEMBER_PUSH_TOKEN_REQUESTED})
      PushNotifications.getInstance().requestPermissions()
      break
  }
}

/* --- Handle messages created on the client --- */
export function * handleNewClientCreatedMessages (action) {
  const {message, status} = action

  if (status === MessageStates.PREPARED_FOR_SENDING) {
    log.debug('Adding new message to outgoing message channel:', message)
    outgoingMessageChannel.put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.SENT})
  }
}

/* --- React on connection state changes iteratively --- */
export function * watchConnectionStateChannel () {
  log.debug('Watching for connection changes...')
  while (true) {
    const action = yield take(connectionStateChannel)

    yield put(action)
    yield call(reactBasedOnConnectionState, action)
  }
}

/* --- React on incoming messages iteratively --- */
export function * watchIncomingMessageChannel () {
  log.debug('Watching for incoming messages or push notifications token...')

  while (true) {
    const action = yield take(incomingMessageChannel)

    if (action.type === ServerSyncActions.REMEMBER_PUSH_TOKEN) {
      yield put(action)
      yield call(checkServerPushNotificationRegistration)
    } else if (action.type === ServerSyncActions.REMEMBER_REGISTRATION) {
      yield put(action)
    } else {
      yield call(handleIncomingMessage, action)
    }
  }
}

/* --- React on outgoing messages iteratively --- */
export function * watchOutgoingMessageChannel () {
  log.debug('Watching for outgoing messages...')

  while (true) {
    const action = yield take(outgoingMessageChannel)
    log.debug('New outgoing message to send...')

    let syncStatus = inSync
    while (!syncStatus) {
      log.debug('Waiting for sync to send messages...')
      yield delay(2000)
      syncStatus = inSync
    }

    let sendingResult = false
    do {
      try {
        log.debug('Trying to send message...')
        sendingResult = yield call(handleOutgoingMessage, action)
        log.debug('Trying to send message was successful, result was:', sendingResult)
      } catch (error) {
        log.warn('Error when sending message (outer backup try/catch):', error)
        sendingResult = false
      }

      // Wait if sending result was false to try again
      if (!sendingResult) {
        log.warn('Sending message was not successful...try again in a second')
        yield delay(1000)
      }
    } while (!sendingResult)

    yield put(action)
  }
}

/* --- Handle incoming message --- */
function * handleIncomingMessage (action) {
  log.debug('Handle incoming message...')
  yield put(action)
  yield put({type: ServerSyncActions.REMEMBER_LATEST_TIMESTAMP, timestamp: action.message['last-modified']})
}

/* --- Handle outgoinng message --- */
function * handleOutgoingMessage (action) {
  log.debug('Handle outgoing message...')

  const {message} = action

  let method = null
  let messageObject = null
  switch (message['type']) {
    case MessageTypes.PLAIN:
      method = 'user-message'
      messageObject = {
        'user': serverSyncUser,
        'user-message': message['user-value'] !== undefined ? message['user-value'] : '',
        'user-timestamp': message['user-timestamp'],
        'client-id': 'c-' + message['user-timestamp']
      }
      break
    case MessageTypes.INTENTION:
      method = 'user-intention'
      messageObject = {
        'user': serverSyncUser,
        'user-intention': message['user-intention'],
        'user-timestamp': message['user-timestamp'],
        'client-id': 'c-' + message['user-timestamp']
      }
      break
    case MessageTypes.VARIABLE:
      method = 'user-variable'
      messageObject = {
        'user': serverSyncUser,
        'variable': message['variable'],
        'value': message['value']
      }
      break
  }

  // Add optional message fields if necessary
  if (message['type'] === MessageTypes.PLAIN) {
    if (message['related-message-id'] !== undefined) {
      messageObject['related-message-id'] = message['related-message-id'].substring(2)
    }
  }
  // Add optional intention fields if necessary
  if (message['type'] === MessageTypes.INTENTION) {
    if (message['user-message'] !== null) {
      messageObject['user-message'] = message['user-message']
    }
    if (message['user-content'] !== null) {
      messageObject['user-content'] = message['user-content']
    }
  }

  try {
    log.debug('Performing RPC call...')
    const result = yield call(rpcPromise, method, messageObject, true)
    log.debug('RPC call performed.')
    if (result !== null && result === true) {
      log.debug('Message successfully sent.')
      return true
    } else {
      log.warn('Error when sending message: Not true as result.')
      return false
    }
  } catch (error) {
    log.warn('Error when sending message:', error)
    return false
  }
}

/* --- React on each state change accordingly --- */
function * reactBasedOnConnectionState (action) {
  log.debug('Connection state changed...')

  const {connectionState, deepstreamUser, deepstreamSecret} = action
  let settings = yield select(selectServerSyncSettings)

  switch (connectionState) {
    case ConnectionStates.INITIALIZED:
      log.info('Initialized.')

      let onlineStatus = online
      while (!onlineStatus) {
        log.debug('Waiting for internet connection to come up...')
        yield delay(2000)
        onlineStatus = online
      }
      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTING})

      break
    case ConnectionStates.CONNECTING:
      if (serverSyncUser === null && deepstreamUser !== undefined && deepstreamSecret !== undefined) {
        log.debug('Remembering registration...')

        yield put({type: ServerSyncActions.REMEMBER_REGISTRATION, deepstreamUser, deepstreamSecret})

        serverSyncUser = deepstreamUser
        PushNotifications.getInstance().setEncryptionKey(('ds:' + serverSyncUser).substring(0, 16), serverSyncUser.substring(serverSyncUser.length - 16))
        log.setUser(serverSyncUser)
        settings = yield select(selectServerSyncSettings)
      }

      log.info('Connecting...')

      try {
        yield call(connectAndLogin, settings)
      } catch (error) {
        log.warn('Error during connect:', error)
        connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.INITIALIZED})
      }

      break
    case ConnectionStates.RECONNECTING:
      log.info('Reconnecting...')

      inSync = false

      break
    case ConnectionStates.CONNECTED:
      log.info('Connected.')

      firstConnectSuccessful = true

      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.SYNCHRONIZATION})

      break
    case ConnectionStates.SYNCHRONIZATION:
      log.info('Synchronization...')

      try {
        yield call(doSynchronization, settings)
      } catch (error) {
        log.warn('Error during synchronization:', error)
        connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTED})
      }

      break
    case ConnectionStates.SYNCHRONIZED:
      log.info('Synchronized.')

      inSync = true

      PushNotifications.getInstance().subscribeRegistration(rememberPushToken)

      break
  }
}

/* --- Synchronize with server after connecting to the same, retrieve messages state update and register listeners (if necessary) --- */
function * doSynchronization (settings) {
  log.debug('Starting to synchronize...')

  const listenerRegistrationSuccessful = yield call(registerListeners, settings)

  if (!listenerRegistrationSuccessful) {
    connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTED})
    return
  }

  try {
    const result = yield call(rpcPromise, 'message-diff', {
      'user': settings.deepstreamUser,
      'server-timestamp': settings.timestamp
    })
    if (result !== null) {
      log.debug('Update result:')
      let timestamp = result['latest-timestamp']
      log.debug('Latest timestamp:' + timestamp)

      log.debug('Adding new messsages to channel...')
      for (let i in result['list']) {
        incomingMessageChannel.put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message: result['list'][i], status: MessageStates.RECEIVED})
      }
      log.debug('New messages added to channel.')

      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.SYNCHRONIZED})
    } else {
      log.warn('Error when retrieving old messages: result is null')
      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTED})
    }
  } catch (error) {
    log.warn('Error when retrieving old messages:', error)
    connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTED})
  }
}

/* --- Connect to server and login using stored access settings retrieved during initialization --- */
async function connectAndLogin (settings) {
  log.debug('Connecting to sync server...')

  const syncServerOptions = {
    maxReconnectAttempts: Infinity,
    reconnectIntervalIncrement: 1000,
    maxReconnectInterval: 10000,
    heartbeatInterval: 20000,
    rpcAckTimeout: 6000,
    rpcResponseTimeout: 10000
  }

  const { useLocalServer, clientVersion, defaultNickname, interventionPattern, role, interventionPassword, localDeepstreamURL, remoteDeepstreamURL } = serverSyncConfig
  const deepstreamURL = useLocalServer ? localDeepstreamURL : remoteDeepstreamURL

  syncClient = createSyncClient(deepstreamURL, syncServerOptions)
  syncClient.on('connectionStateChanged', handleConnectionStateChange)
  syncClient.on('error', handleError)

  if (serverSyncUser === null) {
    await syncClient.login({
      'client-version': clientVersion,
      'role': role,
      'nickname': defaultNickname,
      'intervention-pattern': interventionPattern,
      'intervention-password': interventionPassword
    }, handleConnectionAttempt)
  } else {
    await syncClient.login({
      'client-version': clientVersion,
      'user': settings.deepstreamUser,
      'secret': settings.deepstreamSecret,
      'role': role,
      'intervention-password': interventionPassword
    }, handleConnectionAttempt)
  }
}

/* --- Register listeners on the server to be updated about new incoming messages --- */
async function registerListeners (settings) {
  if (!listenersRegistered) {
    log.info('Registering listener...')
    try {
      await syncClient.event.subscribe('message-update/' + settings.deepstreamUser, function (message) {
        log.debug('Adding new message to channel')
        incomingMessageChannel.put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.RECEIVED})
      })
      listenersRegistered = true
      log.info('Listener registered.')
      return true
    } catch (error) {
      log.warn('Error during listener registration:', error)
      return false
    }
  } else {
    log.debug('Listeners already registered.')
    return true
  }
}

/* --- Add messages prepared for sending to the channel --- */
async function sendPreparedMessages (allMessages) {
  for (const i in allMessages) {
    const message = allMessages[i]

    if (message['client-status'] === MessageStates.PREPARED_FOR_SENDING) {
      outgoingMessageChannel.put({type: MessageActions.ADD_OR_UPDATE_MESSAGE, message, status: MessageStates.SENT})
    }
  }
}

/* --- Callback function for server sync client: Reacts on connection state changes --- */
async function handleConnectionStateChange (connectionState) {
  log.debug('Sync server client internal connection state change:' + connectionState)
  switch (connectionState) {
    case 'AWAITING_CONNECTION':
    case 'CHALLENGING':
    case 'AWAITING_AUTHENTICATION':
    case 'AUTHENTICATING':
      // Expected state changes
      break
    case 'RECONNECTING':
      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.RECONNECTING})
      break
    case 'OPEN':
      if (serverSyncUser !== null) {
        connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTED})
      }
      break
    case 'ERROR':
    case 'CLOSED':
      log.debug('(Potentially unexpected) connection state:', connectionState)
      break
  }
}

/* --- Callback function for server sync client: Informs about authentication results --- */
async function handleConnectionAttempt (success, result) {
  if (success) {
    log.debug('Sync server client connection attempt successful')

    // Remember registration
    if (serverSyncUser === null) {
      log.info('Registration successful')
      log.action('Connection', 'UserRegistration', Platform.OS, new Date())

      try {
        syncClient.close()
      } catch (e) {
          // Do nothing
      }

      const {user, secret} = result

      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.CONNECTING, deepstreamUser: user, deepstreamSecret: secret})
    }
  } else {
    if (!firstConnectSuccessful) {
      log.debug('Sync server client connection attempt NOT successful - reiterating over former steps (next try)')

      try {
        syncClient.close()
      } catch (e) {
        // Do nothing
      }

      await delay(2000)

      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.INITIALIZED})
    } else {
      log.debug('Sync server client connection attempt NOT successful - reconnect will be automatically performed')

      try {
        syncClient.close()
      } catch (e) {
        // Do nothing
      }

      await delay(2000)

      connectionStateChannel.put({type: ServerSyncActions.CONNECTION_STATE_CHANGE, connectionState: ConnectionStates.INITIALIZED})
    }
  }
}

/* --- Callback function for server sync client: Informs about general errors with the sync client --- */
async function handleError (error, event, topic) {
  log.warn('An error occured with the server sync object:', event, error)
}

/* --- Callback function for device status: Informs about client connection state --- */
function handleDeviceConnectivity (isConnected) {
  log.debug('Device connectivity changed. Connected:', isConnected)

  if (fakeDeviceAlwaysOnlineForOfflineDev) {
    online = true
    return
  }

  if (online !== isConnected) {
    online = isConnected
  }
}

/* --- Promises --- */
const rpcPromise = (name, data, requiresSync = false) => new Promise((resolve, reject) => {
  let firstTry = true
  let callRunning = false
  let cleanupCallPerformed = false
  const id = Math.floor((Math.random() * 999999) + 1)

  var cleanupCall = function () {
    if (callRunning) {
      callRunning = false
      cleanupCallPerformed = true
      log.debug('rpcPromise TRACE ' + id + ' - X1 - method:', name, 'cleanup call necessary, reject will be performed.')
      reject(new Error('RPC call died. (Special case solution)'))
    } else {
      log.debug('rpcPromise TRACE ' + id + ' - X2 - method:', name, 'cleanup call not necessary.')
    }
  }

  log.debug('rpcPromise TRACE ' + id + ' - S1 (START) - method:', name)
  try {
    if (syncClient === undefined || syncClient === null || syncClient.rpc === null || (requiresSync && !inSync)) {
      log.debug('rpcPromise TRACE ' + id + ' - E1 - method:', name)
      reject(new Error('Sync client not in sync!'))
    } else {
      log.debug('rpcPromise TRACE ' + id + ' - S2 - method:', name)
      callRunning = true
      const timeout = setTimeout(cleanupCall, 15000)
      syncClient.rpc.make(name, data, (error, result) => {
        callRunning = false
        clearTimeout(timeout)

        if (!cleanupCallPerformed) {
          log.debug('rpcPromise TRACE ' + id + ' - S6 - method:', name, 'is result null or undefined:', (typeof result === 'undefined' || result === null))
          if (error === null) {
            log.debug('rpcPromise TRACE ' + id + ' - S7 (DONE) - method:', name)
            resolve(result)
          } else {
            log.debug('rpcPromise TRACE ' + id + ' - E2 - method:', name, 'error:', error)
            if (error === 'RESPONSE_TIMEOUT' && firstTry) {
              firstTry = false
              log.debug('rpcPromise TRACE ' + id + ' - E2 (EXPECTING RETRY S7 or E2) - method:', name)
              return
            }
            log.debug('rpcPromise TRACE ' + id + ' - E2 (FAIL) - method:', name)
            reject(error)
          }
        } else {
          log.debug('rpcPromise TRACE ' + id + ' - E4 - method:', name, 'received RPC response after cleanup has been performed. -> Ignore RPC response.')
        }
      })
      log.debug('rpcPromise TRACE ' + id + ' - S3 - method:', name)
    }
    log.debug('rpcPromise TRACE ' + id + ' - S4 - method:', name)
  } catch (error) {
    log.debug('rpcPromise TRACE ' + id + ' - E3 - method:', name)
    reject(error)
  }
  log.debug('rpcPromise TRACE ' + id + ' - S5 - method:', name)
})

/* --- Push notifications --- */
function rememberPushToken (token, platform) {
  try {
    log.debug('Trying to remember push token...', token, '(platform:', platform, ')')
    incomingMessageChannel.put({type: ServerSyncActions.REMEMBER_PUSH_TOKEN, platform, token})
    log.debug('Task to remember push token added to incoming message channel')
  } catch (error) {
    log.error('Error at remembering push token:', error)
  }
}

function * checkPushNotificationsRequested () {
  let settings = yield select(selectServerSyncSettings)

  if (settings.pushToken === null && settings.pushRequested === true) {
    // Push token not available but has already been requested (at former startup)
    log.debug('Trying to request push permissions again...')
    PushNotifications.getInstance().requestPermissions()
  }
}

function * checkServerPushNotificationRegistration () {
  let settings = yield select(selectServerSyncSettings)
  do {
    if (settings.pushToken !== null && settings.pushShared === false) {
      // Push settings are available, but not communicated to the server
      log.debug('Trying to communicate push registration to server...')

      try {
        const result = yield call(rpcPromise, 'push-token', {
          'user': settings.deepstreamUser,
          'platform': settings.pushPlatform,
          'token': settings.pushToken
        }, true)
        if (result === true) {
          log.info('Communication of push registration successful')
          yield put({type: ServerSyncActions.REMEMBER_PUSH_TOKEN_SHARED})
        } else {
          log.warn('Error at communication of push registration. Result is:', result)
        }
      } catch (error) {
        log.warn('Error at communication of push registration.')
      }
    } else if (settings.pushToken === null) {
      log.debug('Waiting for push token...')
    } else if (settings.pushShared === true) {
      log.debug('Push token already shared with server')
    }

    settings = yield select(selectServerSyncSettings)
    if (!settings.pushShared) {
      yield delay(5000)
    }
  } while (!settings.pushShared)

  log.debug('Push token registration finished for client and server')
}
