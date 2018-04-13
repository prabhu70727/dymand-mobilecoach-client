import { resettableReducer } from 'reduxsauce'
import { combineReducers } from 'redux'
import configureStore from './CreateStore'
import rootSaga from '../Sagas/'

// listen for the action type of 'RESET', you can change this.
const resettable = resettableReducer('RESET')

export default () => {
  /* ------------- Assemble The Reducers ------------- */
  const rootReducer = combineReducers({
    startup: resettable(require('./StartupRedux').reducer),
    settings: resettable(require('./SettingsRedux').reducer),
    giftedchatmessages: resettable(require('./GiftedChatMessageRedux').reducer),
    guistate: resettable(require('./GUIRedux').reducer),
    fooddiary: resettable(require('./FoodDiaryRedux').reducer),
    messages: resettable(require('./MessageRedux').reducer),
    storyProgress: resettable(require('./StoryProgressRedux').reducer),
    cachedText: resettable(require('./CachedTextRedux').reducer),
    serverSyncSettings: require('./ServerSyncRedux').settingsReducer,
    serverSyncStatus: require('./ServerSyncRedux').statusReducer,
    nav: require('./NavigationRedux').reducer,
    search: require('./SearchRedux').reducer,
    hydrationCompleted: require('./HydrateRedux').reducer,
    tourStatus: resettable(require('./TourRedux').reducer)
  })

  return configureStore(rootReducer, rootSaga)
}
