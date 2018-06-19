
import React, { Component } from 'react'

import {
  StyleSheet,
  View
} from 'react-native'
import Button from 'react-native-button'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'
import I18n from '../../I18n/I18n'
import Video from '../Video/Video.js'

import { Metrics } from '../../Themes/'

// TODO: define proptypes
export default class FullscreenVideo extends Component {
  render () {
    const { source, initialPosition, paused, closeFullscreenCallback } = this.props
    return (
      <View style={styles.mask}>
        <View style={{ paddingTop: 20, paddingBottom: 20, width: Metrics.screenWidth, height: Metrics.screenHeight, backgroundColor: 'black' }}>
          <Video ref='player' initialPosition={initialPosition} fullscreenMode autoStart={!paused} onToggleFullscreen={() => {
            closeFullscreenCallback(this.refs.player.getCurrentTime() + 1, this.refs.player.getPaused())
            this.props.onClose()
          }} source={source} />
        </View>
        <Button
          containerStyle={styles.closeButtonContainer}
          style={styles.closeButton}
          onPress={() => {
            closeFullscreenCallback(this.refs.player.getCurrentTime() + 1, this.refs.player.getPaused())
            this.props.onClose()
          }}>
          {I18n.t('Common.close')}
          <Icon name='md-close' type='ionicon' style={{paddingLeft: 10, fontSize: 30, color: '#fff'}} />
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    ...ifIphoneX({
      top: 55
    })
  },
  closeButton: {
    color: '#fff'
  }
})
