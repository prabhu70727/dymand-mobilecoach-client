import React, { Component } from 'react'
import { View, WebView, StyleSheet, Platform } from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'

import HeaderBar from './HeaderBar'

const websiteStart = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><link href="css/normalize.css" rel="stylesheet" media="all"><link href="css/styles.css" rel="stylesheet" media="all"></head><body>'
const websiteEnd = '</body></html>'

// const REL_IMAGE_DEBUG = '<img class="fill" src="images/voll-fett.png"/>'
const REL_IMAGE_DEBUG = ''
let baseUrl = null

export default class WebRichContent extends Component {
  componentWillMount () {
    if (Platform.OS === 'ios') {
      baseUrl = 'Web/'
    } else if (Platform.OS === 'android') {
      baseUrl = 'file:///android_asset/web/'
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <HeaderBar title='Information' onClose={this.props.onClose} />
        <View style={styles.webViewContainer}>
          <WebView
            source={{html: websiteStart + REL_IMAGE_DEBUG + this.props.children + websiteEnd, baseUrl}}
            style={styles.webView}
            scalesPageToFit={!(Platform.OS === 'ios')}
            javaScriptEnabled={false}
            domStorageEnabled={false}
            />
          {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
        </View>
      </View>
    )
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
