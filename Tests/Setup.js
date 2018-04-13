jest
.mock('react-native-device-info', () => {
  return { isTablet: jest.fn(() => { return false }) }
})
// exclude react-native-fabric from tests (as it would cause errors)
.mock('react-native-fabric', () => {
  return {
    Crashlytics: {
      crash: () => {},
      log: () => {}
    },
    Answers: {
      logCustom: () => {},
      logContentView: () => {}
    }
  }
})
.mock('react-native-piwik', () => {
  return {
    Piwik: {
      initTracker: () => {}
    }
  }
})
.mock('react-native-i18n', () => {
  const english = require('../App/I18n/languages/english.json')
  const keys = require('ramda')
  const replace = require('ramda')
  const forEach = require('ramda')

  return {
    t: (key, replacements) => {
      let value = english[key]
      if (!value) return key
      if (!replacements) return value

      forEach((r) => {
        value = replace(`{{${r}}}`, replacements[r], value)
      }, keys(replacements))
      return value
    }
  }
})
