import React, { Component } from 'react'
import { connect } from 'react-redux'

import ScreenCheckQRUsage from './Authorization/ScreenCheckQRUsage'
import ScreenScanQRCode from './Authorization/ScreenScanQRCode'
import {codeScanMandatory} from './OnboardingNav'
import MessageActions from '../../Redux/MessageRedux'

import Log from '../../Utils/Log'
const log = new Log('Containers/Onboarding/ScreenAuthorizeUser')

// Adjust to the appropriate next screen
// const nextScreen = 'ScreenScreeningSurvey'
const nextScreen = 'ScreenCoachSelection'

class ScreenAuthorizeUser extends Component {
  constructor (props) {
    super(props)

    this.initialState = {
      QRQuestionAnswered: false,
      checkQRCode: false
    }
    this.state = this.initialState
  }

  // This function gets called when the QR-Code is Valid
  qrCodeIsValid (qrData) {
    const { content } = qrData
    log.debug('QR-Code content:', content)

    const { sendCodingIntention } = this.props
    const { navigate } = this.props.navigation

    sendCodingIntention(content)
    navigate(nextScreen)
  }

  // This function gets called wehn the QR-Code is invalid
  qrCodeIsInvalid (qrData) {
    log.debug('QR-Code with data', qrData, 'is invalid')
  }

  render () {
    const { navigate } = this.props.navigation

    // If codeScanMandatory is false show component which asks if the user has a code or not
    if (!codeScanMandatory) {
      if (!this.state.QRQuestionAnswered && !this.state.checkQRCode) {
        return (
          <ScreenCheckQRUsage
            onQRAvailable={() => {
              // If the user has a QR-Code he/she has to scan it now
              this.setState({checkQRCode: true, QRQuestionAnswered: true})
            }}
            onNoQRAvailable={() => {
              // If the user has no QR-Code he will be navigated to the nextScreen (In this case coach-selection)
              navigate(this.nextScreen)
            }}
          />
        )
      } else {
        return (
          <ScreenScanQRCode
            onQRValid={this.qrCodeIsValid.bind(this)}
            onQRInvalid={this.qrCodeIsInvalid.bind(this)}
            onBack={() => {
              // If codeScanMandatory is false the user can go back to the screen where he/she can select if he/she has a QR-Code or not
              this.setState({checkQRCode: false, QRQuestionAnswered: false})
            }}
          />
        )
      }
    }
    // If codeScanMandatory is set to false the user will se the ScreenScanQRCode-Component.
    // The user can't go back and has to scan a valid QR-Code to get to the next screen. (In this case coach-selection)
    return (
      <ScreenScanQRCode
        onQRValid={this.qrCodeIsValid.bind(this)}
        onQRInvalid={this.qrCodeIsInvalid.bind(this)}
      />
    )
  }
}

const mapStateToDispatch = dispatch => ({
  sendCodingIntention: (coding) => dispatch(MessageActions.sendIntention(null, 'coding', coding))
})

export default connect(null, mapStateToDispatch)(ScreenAuthorizeUser)
