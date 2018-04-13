import {AppState, Dimensions} from 'react-native'

import Log from '../Utils/Log'
const log = new Log('Themes/Metrics')

const { width, height } = Dimensions.get('window')

// Used via Metrics.baseMargin
const metrics = {
  navbarHeight: 50,
  marginHorizontal: 10,
  marginVertical: 10,
  section: 25,
  baseMargin: 10,
  doubleBaseMargin: 20,
  smallMargin: 5,
  doubleSection: 50,
  horizontalLineHeight: 1,
  searchBarHeight: 30,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  buttonRadius: 4,
  icons: {
    tiny: 15,
    small: 20,
    medium: 30,
    large: 45,
    xl: 50
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    logo: 200
  },
  appInBackground: false,
  lastBackgroundTimestamp: new Date()
}

// Care about app state changes
AppState.addEventListener('change', function (newAppState) {
  log.debug('New app state:', newAppState)

  if (newAppState === 'active') {
    if (metrics.appInBackground) {
      log.action('App', 'Resume', 'Timestamp', new Date())
      log.action('GUI', 'AppInForeground', true)
      metrics.lastBackgroundTimestamp = new Date()
      metrics.appInBackground = false
    }
  } else {
    if (!metrics.appInBackground) {
      const newTimestamp = new Date()
      log.action('App', 'Usage', 'Millis', newTimestamp - metrics.lastBackgroundTimestamp)
      log.action('GUI', 'AppInForeground', false)
      metrics.lastBackgroundTimestamp = newTimestamp
      metrics.appInBackground = true
    }
  }
})

export default metrics
