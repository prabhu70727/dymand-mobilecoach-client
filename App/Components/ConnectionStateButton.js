import React, {Component} from 'react'

import NavBarButton from './NavBarButton'
import {ConnectionStates} from '../Redux/ServerSyncRedux'
import { Colors } from '../Themes'

export default class ConnectionStateButton extends Component {
  getConnectionStateColor = (connectionState) => {
    const size = 25

    switch (connectionState) {
      case ConnectionStates.INITIALIZING: return {color: Colors.connectionIndicator.neutralState, size}
      case ConnectionStates.INITIALIZED: return {color: Colors.connectionIndicator.neutralState, size}
      case ConnectionStates.CONNECTING: return {color: Colors.connectionIndicator.intermediateState, size}
      case ConnectionStates.RECONNECTING: return {color: Colors.connectionIndicator.intermediateState, size}
      case ConnectionStates.CONNECTED: return {color: Colors.connectionIndicator.successState, size}
      case ConnectionStates.SYNCHRONIZATION: return {color: Colors.connectionIndicator.successState, size}
      case ConnectionStates.SYNCHRONIZED: return {color: Colors.connectionIndicator.successState, size}
      default: return {color: 'gray', size}
    }
  }

  getConnectionStateIcon = (connectionState) => {
    switch (connectionState) {
      case ConnectionStates.INITIALIZING: return 'ios-radio-button-off-outline'
      case ConnectionStates.INITIALIZED: return 'ios-refresh-circle'
      case ConnectionStates.CONNECTING: return 'ios-refresh-circle'
      case ConnectionStates.RECONNECTING: return 'ios-refresh-circle'
      case ConnectionStates.CONNECTED: return 'ios-refresh-circle'
      case ConnectionStates.SYNCHRONIZATION: return 'ios-refresh-circle'
      case ConnectionStates.SYNCHRONIZED: return 'ios-checkmark-circle'
      default: return 'ios-radio-button-on-outline'
    }
  }

  render () {
    const {onPress, connectionState} = this.props

    return (
      <NavBarButton
        position='right'
        icon={this.getConnectionStateIcon(connectionState)}
        iconStyle={this.getConnectionStateColor(connectionState)}
        onPress={() => onPress()} />
    )
  }
}
