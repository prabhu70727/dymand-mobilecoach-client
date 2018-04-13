import { AsyncStorage } from 'react-native'
import { persistStore } from 'redux-persist'

import AppConfig from '../Config/AppConfig'
import ReduxPersist from '../Config/ReduxPersist'
import StartupActions from '../Redux/StartupRedux'
import DebugConfig from '../Config/DebugConfig'
import HydrateActions from '../Redux/HydrateRedux'

const updateReducers = (store: Object) => {
  const reducerVersion = ReduxPersist.reducerVersion
  const config = ReduxPersist.storeConfig
  const startup = () => store.dispatch(StartupActions.startup())
  const signalStorageLoaded = () => store.dispatch(HydrateActions.signalStorageLoaded(true))

  // Check to ensure latest reducer version
  AsyncStorage.getItem('reducerVersion').then((localVersion) => {
    if (AppConfig.config.dev.purgeStoreAtStartup || localVersion !== reducerVersion) {
      if (DebugConfig.useReactotron) {
        console.tron.display({
          name: 'PURGE',
          value: {
            'Old Version:': localVersion,
            'New Version:': reducerVersion
          },
          preview: 'Reducer Version Change Detected',
          important: true
        })
      }
      // Purge store
      persistStore(store, config, () => {
        signalStorageLoaded()
        startup()
      }
      ).purge()
      AsyncStorage.setItem('reducerVersion', reducerVersion)
    } else {
      persistStore(store, config, () => {
        signalStorageLoaded()
        startup()
      }
      )
    }
  }).catch(() => {
    persistStore(store, config, () => {
      signalStorageLoaded()
      startup()
    }
    )
    AsyncStorage.setItem('reducerVersion', reducerVersion)
  })
}

export default {updateReducers}
