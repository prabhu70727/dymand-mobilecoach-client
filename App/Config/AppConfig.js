// Simple React Native specific changes

export default {
  // font scaling override - RN default is on
  allowTextFontScaling: true,
  // Server URL

  // Current instantiation of white label app for project
  project: 'whitelabel',

  // Configuration of the project
  config: {
    dev: {
      purgeStoreAtStartup: true,
      fakeDeviceAlwaysOnlineForOfflineDev: false,
      allowDebugKeyboard: false
    },
    storage: {
      encryptedReduxStorage: false,
      reduxStorageBlacklist: ['search', 'nav', 'hydrationCompleted', 'serverSyncStatus', 'giftedchatmessages', 'guistate']
    },
    logger: { // Levels: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF', 'CRASHLYTICS'
      defaultLevel: 'DEBUG', // 'OFF' to deactivate the WHOLE logger (also exceptions)
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
      incrementShownMessagesBy: 25,
      // Show message instead if loading-indicator if chat is empty
      showEmptyChatMessage: false
    },
    startup: {
      automaticallyRequestPushPermissions: false,
      automaticallyConnectOnFirstStartup: true,
      backButtonInOnboardingEnabled: false,
      onboardingURL: '---'
    },
    serverSync: {
      useLocalServer: true,
      clientVersion: 1,
      role: 'participant',
      defaultNickname: 'Whitelabel App User',
      interventionPattern: 'Test Intervention',
      interventionPassword: 'interventionPassword',
      androidSenderId: '123456789012',
      localDeepstreamURL: 'ws://127.0.0.1:6020/deepstream',
      localRestURL: 'http://127.0.0.1:8080/PMCP/api/v02/',
      remoteDeepstreamURL: 'wss://---:8443/deepstream',
      remoteRestURL: 'https://---/PMCP/api/v02/'
    },
    whitelabel: {
      shareUrl: {
        fr: 'https://www.shareurl-fr.fr',
        it: 'https://www.shareurl-it.it',
        de: 'https://www.shareurl-de.de'
      },
      tourSteps: ['begin', 'tour-start', 'tour-end'],
      tourFile: 'tour/tour.json'
    }
  }
}
