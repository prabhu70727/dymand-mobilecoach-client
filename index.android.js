import './App/Config/ReactotronConfig'
import { AppRegistry } from 'react-native'
import { ImageCacheProvider } from 'react-native-cached-image'

import App from './App/Containers/App'
import AppConfig from './App/Config/AppConfig'
import PushNotifications from './App/Utils/PushNotifications'

const { config } = AppConfig

// Reset image cache at startup (if necessary)
if (config.dev.purgeStoreAtStartup) {
  (new ImageCacheProvider()).getImageCacheManager().clearCache()
}

// Initialize push notifications
PushNotifications.getInstance().init(config.dev.purgeStoreAtStartup, config.serverSync.androidSenderId)

// Start app
AppRegistry.registerComponent('MobileCoachClient', () => App)
