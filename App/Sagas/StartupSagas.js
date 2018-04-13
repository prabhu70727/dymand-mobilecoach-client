// import { put, select } from 'redux-saga/effects'
// import SettingsActions from '../Redux/SettingsRedux'

// export const selectLanguage = (state) => state.settings.language // get the language from the settings reducer

// process STARTUP actions
export function * startup (action) {
  if (__DEV__ && console.tron) {
    // straight-up string logging
    console.tron.log('Hello, I\'m an example of how to log via Reactotron.')

    // logging an object for better clarity
  //   console.tron.log({
  //     message: 'pass objects for better logging',
  //     someGeneratorFunction: selectAvatar
  //   })

  //   // fully customized!
  //   const subObject = { a: 1, b: [1, 2, 3], c: true }
  //   subObject.circularDependency = subObject // osnap!
  //   console.tron.display({
  //     name: '🔥 IGNITE 🔥',
  //     preview: 'You should totally expand this',
  //     value: {
  //       '💃': 'Welcome to the future!',
  //       subObject,
  //       someInlineFunction: () => true,
  //       someGeneratorFunction: startup,
  //       someNormalFunction: selectAvatar
  //     }
  //   })
  }

  // const language = yield select(selectLanguage)

  // Always set the I18n locale to the language in the settings, or the views would render in the language of the device's locale and not that of the setting.
  // yield put(SettingsActions.changeLanguage(language))
}
