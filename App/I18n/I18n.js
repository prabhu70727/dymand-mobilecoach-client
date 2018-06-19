import I18n from 'react-native-i18n'
import moment from 'moment'

// Required for compatibility issues
import 'moment/locale/en-gb'
import 'moment/locale/de'
import 'moment/locale/fr'
import 'moment/locale/it'

import Log from '../Utils/Log'
const log = new Log('I18n/I18n')

// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
I18n.fallbacks = true

// Add different defaultLocale here (default is 'en'). It will be used as a fallback when device locale isn't found in translations
I18n.defaultLocale = 'en'

// English language is the main fallback language
I18n.translations = {
  en: require('./languages/english.json'),
  de: require('./languages/de.json'),
  fr: require('./languages/fr.json'),
  it: require('./languages/it.json')
}

// Use device language as default language if available as translation, otherwise default language
I18n.locale = I18n.translations.hasOwnProperty(I18n.locale.substr(0, 2)) ? I18n.locale.substr(0, 2) : I18n.defaultLocale

// Set base locale also for moment
moment.locale(I18n.currentLocale())

log.debug('Current locale:', I18n.currentLocale())

export default I18n
