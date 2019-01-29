// Simple React Native specific changes

export default {
  // font scaling override - RN default is on
  allowTextFontScaling: true,
  // Server URL

  // Current instantiation of whitelabel app for project. Should be adjusted in
  // camelCase name of app, e.g., demoXyz
  // (CAUTION 1: MUST be adjusted for encrypted apps!!!!)
  // (CAUTION 2: Parameter AppConfig.whitelabel must be changed to the same name)
  project: 'dymand',
  // Encryption secret for instance of whitelabel app project.
  projectSecret: 'dymand-top-secret',

  // Configuration of the project
  config: {
    dev: {
      purgeStoreAtStartup: false,
      fakeDeviceAlwaysOnlineForOfflineDev: false,
      fakeQRCodeScanWithURL: null,
      allowDebugKeyboard: false
    },
    storage: {
      encryptedReduxStorage: false,
      reduxStorageBlacklist: ['search', 'nav', 'hydrationCompleted', 'serverSyncStatus', 'giftedchatmessages', 'guistate']
    },
    logger: { // Levels: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF', 'CRASHLYTICS'
      defaultLevel: 'OFF', // 'OFF' to deactivate the WHOLE logger (also exceptions)
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
        'Sagas/GiftedChatMessageSaga': 'DEBUG',
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
      automaticallyRequestPushPermissions: true,
      automaticallyConnectOnFirstStartup: true,
      backButtonInOnboardingEnabled: false,
      onboardingURL: '---'
    },
    serverSync: {
      useLocalServer: false,
      clientVersion: 1,
      role: 'participant',
      defaultNickname: 'newParticipant',
      interventionPattern: 'DYMAND TEST',
      interventionPassword: 'TtlYoHob9P3d4XRl',
      androidSenderId: '465399551649',
      localDeepstreamURL: 'ws://127.0.0.1:6020/deepstream',
      localRestURL: 'http://127.0.0.1:8080/MC/api/v02/',
      localMediaURL: 'http://127.0.0.1/MC/files/',
      //remoteDeepstreamURL: 'wss://dymand-cdhi.ethz.ch:6021/deepstream',
      //remoteRestURL: 'https://dymand-cdhi.ethz.ch:8444/MC/api/v02/',
      //remoteMediaURL: 'https://dymand-cdhi.ethz.ch:8444/MC/files/'
      remoteDeepstreamURL: 'wss://dymand-cdhi.ethz.ch/ds/deepstream',
      remoteRestURL: 'https://dymand-cdhi.ethz.ch/MC/api/v02/',
      remoteMediaURL: 'https://dymand-cdhi.ethz.ch/MC/files/'
    },
    dymand: {
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
