import I18n from '../I18n/I18n'
import { put } from 'redux-saga/effects'
import moment from 'moment'

import {MessageActions} from '../Redux/MessageRedux'

import Log from '../Utils/Log'
const log = new Log('Sagas/SettingsSagas')

export function * updateLanguage (action) {
  const {language} = action
  log.debug('Language change:', language)
  I18n.locale = language.substr(0, 2)
  moment.locale(language.substr(0, 2))

  yield put({type: MessageActions.SEND_INTENTION, text: null, intention: 'language', content: language})
}
