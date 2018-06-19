import { createStore, applyMiddleware, compose } from 'redux'
import { autoRehydrate } from 'redux-persist'
import createSagaMiddleware from 'redux-saga'

import RehydrationServices from '../Services/RehydrationServices'
import ScreenTracking from './ScreenTrackingMiddleware'

// Creates the store
export default (rootReducer, rootSaga, encryptionKey) => {
  /* ------------- Redux Configuration ------------- */

  const middleware = []
  const enhancers = []

  /* ------------- Analytics Middleware ------------- */

  middleware.push(ScreenTracking)

  /* ------------- Saga Middleware ------------- */

  const sagaMiddleware = createSagaMiddleware({ })
  middleware.push(sagaMiddleware)

  /* ------------- Assemble Middleware ------------- */

  enhancers.push(applyMiddleware(...middleware))

  /* ------------- AutoRehydrate Enhancer ------------- */

  // Add the autoRehydrate enhancer
  enhancers.push(autoRehydrate())

  // Add react dev tools
  const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      }) : compose

  const store = createStore(rootReducer, composeEnhancers(...enhancers))

  // Configure persistStore (including encryption)
  RehydrationServices.updateReducers(store, encryptionKey)

  // Kick off root saga
  sagaMiddleware.run(rootSaga)

  return store
}
