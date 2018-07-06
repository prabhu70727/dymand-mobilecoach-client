import React, { Component } from 'react'
import { StyleSheet, View, WebView, Platform, ActivityIndicator } from 'react-native'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import { connect } from 'react-redux'
import KeyboardSpacer from 'react-native-keyboard-spacer'

import AppConfig from '../../Config/AppConfig'
import { Colors } from '../../Themes/'
import ServerSyncActions from '../../Redux/ServerSyncRedux'
import StartupActions from '../../Redux/StartupRedux'

import Log from '../../Utils/Log'
const log = new Log('Containers/Onboarding/ScreenScreeningSurvey')

// Adjust to the appropriate next screen
const nextScreen = 'ScreenCoachSelection'

/*
 * Supported commands:
 *
 * if (config.externalId != "" && config.externalSecret != "") {
 *  readyCheck()
 * }
 *
 * function readyCheck() {
 *  if (window.postMessage != undefined && window.postMessage != null && typeof window.postMessage === 'function' && window.postMessage.length === 1) {
 *    sendLoginData()
 *  } else {
 *    setTimeout(readyCheck, 100)
 *  }
 * }
 *
 * function sendLoginData() {
 *  window.postMessage('{"id":"' + config.externalId + '", "secret":"' + config.externalSecret + '"}')
 *  window.postMessage('complete')
 * }
 */

class ScreenScreeningSurvey extends Component {
  render () {
    return (
      <View style={Styles.container}>
        <WebView
          ref='web'
          source={{uri: AppConfig.config.startup.onboardingURL}}
          style={Styles.webView}
          scalesPageToFit={!(Platform.OS === 'ios')}
          javaScriptEnabled
          domStorageEnabled={false}
          onMessage={this.onEvent.bind(this)}
          // onLoadEnd={this.onLoadEnd}
          // onNavigationStateChange={this.onNavigationStateChange}
          onError={this.onError}
          startInLoadingState
          renderLoading={() => {
            return (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} >
                <ActivityIndicator
                  animating
                  color={Colors.onboarding.loadingIndicator}
                  size='large'
                  hidesWhenStopped />
              </View>
            )
          }}
          renderError={(e) => {
            return (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} >
                <ActivityIndicator
                  animating
                  color={Colors.onboarding.loadingIndicator}
                  size='large'
                  hidesWhenStopped />
              </View>
            )
          }}
        />
        {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
      </View>
    )
  }

  onError = (e) => {
    if (e) {
      log.warn('Reloading...')
      setTimeout(this.refs.web.reload, 5000)
    }
  }

  onEvent = (event) => {
    const { data } = event.nativeEvent
    log.debug('Event:', data)

    switch (data) {
      case 'complete':
        const {navigate} = this.props.navigation
        navigate(nextScreen)
        break
      default:
        const jsonData = JSON.parse(data)
        log.debug('Storing new communicaton data:', jsonData)
        this.props.rememberRegistration(jsonData.id, jsonData.secret)
        this.props.manuallyConnect()
        break
    }
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapStateToDispatch = dispatch => ({
  rememberRegistration: (deepstreamUser, deepstreamSecret) => dispatch(ServerSyncActions.rememberRegistration(deepstreamUser, deepstreamSecret)),
  manuallyConnect: () => dispatch(StartupActions.manuallyConnect())
})

export default connect(mapStateToProps, mapStateToDispatch)(ScreenScreeningSurvey)

const Styles = StyleSheet.create({
  container: {flex: 1, paddingLeft: 0, paddingRight: 0, backgroundColor: Colors.onboarding.background, ...ifIphoneX({ paddingTop: 40 })},
  webView: { position: 'absolute', backgroundColor: Colors.onboarding.background, left: 0, top: 0, bottom: 0, right: 0 }
})
