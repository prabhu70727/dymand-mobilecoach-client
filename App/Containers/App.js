import React, { Component } from 'react'
import { Platform } from 'react-native'
import { setCustomText } from 'react-native-global-props'
import { Provider } from 'react-redux'

import '../I18n/I18n' // import this before RootContainer as RootContainer is using react-native-i18n, and I18n.js needs to be initialized before that!
import DebugConfig from '../Config/DebugConfig'
import RootContainer from './RootContainer'
import createStore from '../Redux'
import { isIphoneX } from 'react-native-iphone-x-helper'
import Fonts from '../Themes/Fonts'

import Log from '../Utils/Log'
const log = new Log('Containers/App')

// create our store
const store = createStore()

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

  render () {
    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    )
  }
}

// allow reactotron overlay for fast design in dev mode
export default DebugConfig.useReactotron
  ? console.tron.overlay(App)
  : App
