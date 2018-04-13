// Simple React Native specific changes

export default {
  // font scaling override - RN default is on
  allowTextFontScaling: true,
  // Server URL

  // Current instantiation of white label app for project
  project: 'whitelabel',

  // configuration for the project TODO: should we do this similar for bundled translated strings, images, intro page styles etc.?
  config: {
    dev: {
      purgeStoreAtStartup: true,
      fakeDeviceAlwaysOnlineForOfflineDev: false,
      allowDebugKeyboard: false
    },
    logger: { // Levels: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF', 'CRASHLYTICS'
      defaultLevel: 'OFF', // 'OFF' to deactivate the WHOLE logger (also exceptions)
      trackActivities: false,
      trackingURL: 'https://---/piwik/piwik.php',
      trackingId: 0,
      loggerLevels: {
        'Redux/MessageRedux': 'INFO',
        'Redux/ServerSyncRedux': 'INFO',
        'Sagas/MessageSagas': 'INFO',
        'Sagas/ServerSyncSagas': 'INFO',
        'Sagas/GiftedChatMessageSaga': 'INFO',
        'Utils/PushNotifications': 'INFO',
        'FoodDiary/DiaryView': 'INFO',
        'AddMealModule/AddMealPreStep': 'INFO',
        'AddMealModule/AddFoodStep': 'INFO',
        'AddMealModule/AddMealContainer': 'INFO',
        'Redux/StoryProgressRedux': 'INFO',
        'AddMealModule/SelectableFoodList': 'INFO',
        'AddMealModule/FoodMetrics': 'INFO',
        'Sagas/FoodDiarySaga': 'INFO',
        'Navigation/ReduxNavigation': 'INFO',
        'Containers/AddMealModule/FoodMetrics': 'WARN'
      }
    },
    typingIndicator: {
      fastMode: true,
      // typing speed (words/minute)
      coachTypingSpeed: 200,
      // max delay for larger msgs (in ms)
      maxTypingDelay: 15000,
      // delay before active elements (in ms)
      interactiveElementDelay: 300
    },
    messages: {
      initialNumberOfMinimalShownMessages: 10,
      incrementShownMessagesBy: 25
    },
    serverSync: {
      useLocalServer: false,
      clientVersion: 1,
      role: 'participant',
      defaultNickname: 'Whitelabel App User',
      interventionPattern: '----',
      interventionPassword: '----',
      androidSenderId: '123456789012',
      localDeepstreamURL: 'ws://127.0.0.1:6020/deepstream',
      localRestURL: 'http://127.0.0.1:8080/PMCP/api/v02/',
      remoteDeepstreamURL: 'wss://---:8443/deepstream',
      remoteRestURL: 'https://---/PMCP/api/v02/'
    },
    whitelabel: {
      tourSteps: ['begin', 'tour-start', 'tour-end'],
      tourFile: 'tour/tour.json'
    }
  }
}
