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
      } else reject(new Error('Could not find key:', propName))
    })
  }
}

export default JSONStorage
