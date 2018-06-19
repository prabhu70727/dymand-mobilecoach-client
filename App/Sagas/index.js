import { takeEvery, all, fork } from 'redux-saga/effects'

/* ------------- Actions ------------- */

import { StartupActions } from '../Redux/StartupRedux'
import { GUIActions } from '../Redux/GUIRedux'
import { MessageActions } from '../Redux/MessageRedux'
import { SettingsActions } from '../Redux/SettingsRedux'

/* ------------- Sagas ------------- */

import { initializeGiftedChat, loadEarlierMessages, watchNewOrUpdatedMessageForGiftedChat } from './GiftedChatMessageSaga'
import { sendMessage, sendInvisibleMessage, sendIntention, sendVariableValue, disableMessage, executeCommand, watchMessageUpdateChannel } from './MessageSagas'
import { initializeServerSync, handleCommands, handleNewClientCreatedMessages, watchConnectionStateChannel, watchIncomingMessageChannel, watchOutgoingMessageChannel } from './ServerSyncSagas'
import { updateLanguage } from './SettingsSagas'
import { watchCommandToExecute } from './FoodDiarySaga'

/* ------------- API ------------- */

// The API we use is only used from Sagas, so we create it here and pass along
// to the sagas which need it.
// const api = DebugConfig.useFixtures ? FixtureAPI : API.create()

/* ------------- Connect Actions To Sagas ------------- */

export default function * root () {
  yield all([
    // Settings Saga
    takeEvery(SettingsActions.CHANGE_LANGUAGE, updateLanguage),

    // FoodDiary Saga
    yield fork(watchCommandToExecute),

    // Gifted Chat (top layer)
    takeEvery(StartupActions.STARTUP, initializeGiftedChat),
    takeEvery(GUIActions.LOAD_EARLIER, loadEarlierMessages),

    yield fork(watchNewOrUpdatedMessageForGiftedChat),

    // Messages (middle layer)
    takeEvery(MessageActions.SEND_MESSAGE, sendMessage),
    takeEvery(MessageActions.SEND_INVISIBLE_MESSAGE, sendInvisibleMessage),
    takeEvery(MessageActions.SEND_INTENTION, sendIntention),
    takeEvery(MessageActions.SEND_VARIABLE_VALUE, sendVariableValue),
    takeEvery(MessageActions.DISABLE_MESSAGE, disableMessage),
    takeEvery(MessageActions.EXECUTE_COMMAND, executeCommand),

    yield fork(watchMessageUpdateChannel),

    // Server Sync (bottom layer)
    takeEvery(StartupActions.STARTUP, initializeServerSync),
    takeEvery(StartupActions.MANUALLY_CONNECT, initializeServerSync),
    takeEvery(MessageActions.COMMAND_TO_EXECUTE, handleCommands),
    takeEvery(MessageActions.ADD_OR_UPDATE_MESSAGE, handleNewClientCreatedMessages),

    yield fork(watchConnectionStateChannel),
    yield fork(watchIncomingMessageChannel),
    yield fork(watchOutgoingMessageChannel)
  ])
}
