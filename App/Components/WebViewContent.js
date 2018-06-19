import React, { Component } from 'react'
import { View, WebView, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import {connect} from 'react-redux'
import KeyboardSpacer from 'react-native-keyboard-spacer'

import HeaderBar from './HeaderBar'
import {Colors} from '../Themes/'
import ServerMessageActions from '../Redux/MessageRedux'

import Log from '../Utils/Log'
const log = new Log('Components/WebViewContent')

/*
 * Supported commands:
 *  window.postMessage('{"variable":"$result", "value": 20}');
 *  window.postMessage('close');
 *  window.postMessage('complete');
 */

class WebViewContent extends Component {
  componentWillMount () {
  }

  render () {
    log.debug('Opening web:', this.props.children)

    return (
      <View style={styles.container}>
        <HeaderBar title='Befragung' onClose={this.props.onClose} />
        <View style={styles.webViewContainer}>
          <WebView
            ref='web'
            source={{uri: this.props.children + '?' + Math.random()}}
            style={styles.webView}
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
                    color={Colors.modal.loadingIndicator}
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
                    color={Colors.modal.loadingIndicator}
                    size='large'
                    hidesWhenStopped />
                </View>
              )
            }}
          />
          {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
        </View>
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
      case 'close':
        this.props.onClose(false)
        break
      case 'complete':
        this.props.onClose(true)
        break
      default:
        const jsonData = JSON.parse(data)
        log.debug('Communicating value change to server:', jsonData)
        this.props.sendVariableValue(jsonData.variable, jsonData.value)
        break
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  webViewContainer: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: '#fff'
  },
  webView: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  }
})

const mapStateToProps = (state) => {
  return {
  }
}

const mapStateToDispatch = dispatch => ({
  sendVariableValue: (variable, value) => dispatch(ServerMessageActions.sendVariableValue(variable, value))
})

export default connect(mapStateToProps, mapStateToDispatch)(WebViewContent)
