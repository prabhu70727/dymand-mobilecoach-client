import React, {Component} from 'react'
import {Alert, TouchableWithoutFeedback} from 'react-native'
import { connect } from 'react-redux'

import Log from '../../Utils/Log'
const log = new Log('Containers/Settings/SendDebugStateButton')

class SendDebugStateButton extends Component {
  constructor (props) {
    super(props)
    this.sendDebugTaps = 0
  }

  onPress () {
    this.sendDebugTaps += 1
    if (this.sendDebugTaps >= 10) {
      Alert.alert(
          'Do you wish to share your app data with the developers?',
          '',
        [
          {text: 'No', onPress: () => { this.sendDebugTaps = 0 }, style: 'cancel'},
          {
            text: 'Yes',
            onPress: () => {
              this.sendDebugTaps = 0
              this.postDebugState()
            }
          }
        ],
          { cancelable: false }
      )
    }
  }

  postDebugState () {
    const {wholeState} = this.props
    fetch('https://dc.pathmate.online/upload/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state: wholeState, log: log.getCache() })
    }).then((response) => {
      log.debug('App data successfully sent to server.')
      Alert.alert(
        'Thank you!',
        '',
        [],
        { cancelable: true }
      )
    })
    .catch((error) => {
      log.warn(error)
    })
  }

  render () {
    return (
      <TouchableWithoutFeedback onPress={() => this.onPress()}>
        {this.props.children}
      </TouchableWithoutFeedback>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    wholeState: state
  }
}

export default connect(mapStateToProps)(SendDebugStateButton)
