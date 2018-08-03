import { AsyncStorage } from 'react-native'
import debugState from '../Fixtures/debugState.json'

const safeDebugState = {
  ...debugState,
  // Don't load deepstream credentials from debug state
  serverSyncSettings: {
    ...debugState.serverSyncSettings,
    deepstreamUser: 'user', // null,
    deepstreamSecret: 'secret', // null,
    restUser: null,
    restToken: null,
    pushPlatform: null,
    pushToken: null
  }
}
// const safeDebugState = {
//   ...debugState,
//   // DS credentials from 'debugUser' on Test-Intervention:
//   serverSyncSettings: {
//     timestamp: 1531384930378,
//     registered: true,
//     deepstreamUser: 'wAMj81rpbcNMzNCeOL9zYuet315313847752315GbbZyePukao8yRBrAWN5DfHF',
//     deepstreamSecret: 'LDrHzK325lSoJbB1qxOIBHmkw9Y1DzMhwa9yaEAr786Er6b4RLKNYxtPRJXREdyYY5EwbRwXe86sbB5B0cP8r29TrziOuTmDTkiXL4ab5UUxf2DUtG5MGaoyu0SfOuFu',
//     restUser: 'ds:wAMj81rpbcNMzNCeOL9zYuet315313847752315GbbZyePukao8yRBrAWN5DfHF',
//     restToken: null,
//     pushPlatform: null,
//     pushToken: null,
//     pushRequested: true,
//     pushShared: false
//   }
// }
const JSONStorage = {
  ...AsyncStorage,
  getItem: function (key, callback) {
    // redux-persist is searching for keys like 'reduxPersist:settings'
    const propName = key.replace('reduxPersist:', '')
    return new Promise((resolve, reject) => {
      if (safeDebugState[propName]) {
        let serialized = JSON.stringify(safeDebugState[propName])
        callback && callback(null, serialized)
        resolve(serialized)
      } else {
        reject(new Error('Could not find key: ' + propName))
      }
    })
  }
}

export default JSONStorage
