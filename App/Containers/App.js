import React, { Component } from 'react'
import { Platform } from 'react-native'
import { setCustomText } from 'react-native-global-props'
import { Provider } from 'react-redux'
import { isIphoneX } from 'react-native-iphone-x-helper'
import SInfo from 'react-native-sensitive-info'

import '../I18n/I18n' // import this before RootContainer as RootContainer is using react-native-i18n, and I18n.js needs to be initialized before that!
import RootContainer from './RootContainer'
import AppConfig from '../Config/AppConfig'
import createStore from '../Redux'
import Fonts from '../Themes/Fonts'

import Log from '../Utils/Log'
const log = new Log('Containers/App')

// App config
const { config } = AppConfig

// Redux storage
let store = null

// App status
let initialized = false
let storeReady = false

// Show OS and phone
log.info('Running on', Platform.OS)
if (isIphoneX()) {
  log.info('It\'s an iPhone X')
}

// Track user activity
if (!__DEV__) {
  log.enableUserTracking()
}
log.action('App', 'Startup', 'Timestamp', new Date())
log.action('GUI', 'AppInForeground', true)

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 *
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
class App extends Component {
  constructor () {
    super()

    const customTextProps = {
      style: {
        fontFamily: Fonts.type.family
      }
    }

    setCustomText(customTextProps)
  }

  componentWillMount () {
    if (!initialized) {
      initialized = true

      // Care for encryption if required
      if (config.storage.encryptedReduxStorage) {
        // Check/create encryption key in keychain
        log.debug('Checking/creating encryption key...')
        SInfo.getItem('encryptionKey', {
          sharedPreferencesName: 'com.pathmate.' + AppConfig.project,
          keychainService: 'com.pathmate.' + AppConfig.project}).then(value => {
            let encryptionKey = null

            if (value === undefined || value == null) {
              log.debug('No encryption key found - creating one...')
              encryptionKey = createRandomSecret()

              SInfo.setItem('encryptionKey', encryptionKey, {
                sharedPreferencesName: 'com.pathmate.' + AppConfig.project,
                keychainService: 'com.pathmate.' + AppConfig.project,
                encrypt: true
              })
            } else {
              log.debug('Using existing encryption key')
              encryptionKey = value
            }

            // create our store
            store = createStore(encryptionKey)
            storeReady = true
            this.forceUpdate()
          })
      } else {
        // create our store
        store = createStore(null)
        storeReady = true
      }
    }
  }

  render () {
    if (storeReady) {
      return (
        <Provider store={store}>
          <RootContainer />
        </Provider>
      )
    } else {
      return null
    }
  }
}

function createRandomSecret () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

export default App
