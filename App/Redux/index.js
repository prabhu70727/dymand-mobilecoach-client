import { resettableReducer } from 'reduxsauce'
import { combineReducers } from 'redux'
import configureStore from './CreateStore'
import rootSaga from '../Sagas/'

// listen for the action type of 'RESET', you can change this.
const resettable = resettableReducer('RESET')

export default (encryptionKey) => {
  /* ------------- Assemble The Reducers ------------- */
  const rootReducer = combineReducers({
    // General reducers
    startup: resettable(require('./StartupRedux').reducer),
    settings: resettable(require('./SettingsRedux').reducer),
    messages: resettable(require('./MessageRedux').reducer),
    storyProgress: resettable(require('./StoryProgressRedux').reducer),
    serverSyncSettings: resettable(require('./ServerSyncRedux').settingsReducer),

    // Project-specific reducers
    cachedText: resettable(require('./CachedTextRedux').reducer),
    tourStatus: resettable(require('./TourRedux').reducer),
    fooddiary: resettable(require('./FoodDiaryRedux').reducer),

    // Blacklisted reducers (will not be stored persistent, so also reset it not necessary)
    nav: require('./NavigationRedux').reducer,
    hydrationCompleted: require('./HydrateRedux').reducer,
    serverSyncStatus: require('./ServerSyncRedux').statusReducer,
    giftedchatmessages: require('./GiftedChatMessageRedux').reducer,
    guistate: require('./GUIRedux').reducer
  })

  return configureStore(rootReducer, rootSaga, encryptionKey)
}
