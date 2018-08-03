// Simple React Native specific changes

export default {
  // font scaling override - RN default is on
  allowTextFontScaling: true,
  // Server URL

  // Current instantiation of whitelabel app for project. Should be adjusted in
  // camelCase name of app, e.g., demoXyz
  // (CAUTION 1: MUST be adjusted for encrypted apps!!!!)
  // (CAUTION 2: Parameter AppConfig.whitelabel must be changed to the same name)
  project: 'whitelabel',
  // Encryption secret for instance of whitelabel app project.
  projectSecret: 'whitelabel-top-secret',

  // Configuration of the project
  config: {
    dev: {
      purgeStoreAtStartup: true,
      fakeDeviceAlwaysOnlineForOfflineDev: false,
      fakeQRCodeScanWithURL: null,
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
        'AddMealModule/AddMealPreStep': 'INFO',
        'AddMealModule/AddFoodStep': 'INFO',
        'AddMealModule/AddMealContainer': 'INFO',
        'AddMealModule/SelectableFoodList': 'INFO',
        'AddMealModule/FoodMetrics': 'INFO',
        'Components/CameraComponent': 'INFO',
        'Components/RecordAudioComponent': 'INFO',
        'Components/CustomMessages/MediaInput': 'INFO',
        'Containers/AddMealModule/FoodMetrics': 'WARN',
        'FoodDiary/DiaryView': 'INFO',
        'Navigation/ReduxNavigation': 'INFO',
        'Redux/MessageRedux': 'INFO',
        'Redux/ServerSyncRedux': 'INFO',
        'Redux/StoryProgressRedux': 'INFO',
        'Sagas/FoodDiarySaga': 'INFO',
        'Sagas/GiftedChatMessageSaga': 'INFO',
        'Sagas/MessageSagas': 'INFO',
        'Sagas/ServerSyncSagas': 'INFO',
        'Utils/PushNotifications': 'INFO'
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
      useLocalServer: false,
      clientVersion: 1,
      role: 'participant',
      defaultNickname: 'MobileCoach Client User',
      interventionPattern: '----',
      interventionPassword: '----',
      androidSenderId: '123456789012',
      localDeepstreamURL: 'ws://127.0.0.1:6020/deepstream',
      localRestURL: 'http://127.0.0.1:8080/MC/api/v02/',
      localMediaURL: 'http://127.0.0.1/MC/files/',
      remoteDeepstreamURL: 'wss://---:8443/deepstream',
      remoteRestURL: 'https://---/MC/api/v02/',
      remoteMediaURL: 'https://---/MC/files/'
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
