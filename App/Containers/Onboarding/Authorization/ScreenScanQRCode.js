import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CryptoJS from 'crypto-js'
import urlapi from 'url'

import CameraComponent from '../../../Components/CameraComponent'
import AppConfig from '../../../Config/AppConfig'

import Log from '../../../Utils/Log'
const log = new Log('Containers/Onboarding/Authorization/ScreenScanQRCode')

class ScreenScanQRCode extends Component {
  navigateToScreen (screen) {
    const { navigate } = this.props.navigation
    navigate(screen)
  }

  // This function validates the QR-Code and should return an object with the QR-Data as data-prop and true or false in the isValid-prop
  // If the QR-Code is invalid the camera component will NOT Alert and silently retry to scan the QR-Code
  validateQRCode (qrData) {
    log.debug('Validating QR-code:', qrData)
    const response = {
      data: qrData,
      isValid: false
    }
    try {
      const encodedString = urlapi.parse(qrData.data).search.substring(1)

      const reb64 = CryptoJS.enc.Hex.parse(encodedString)
      const bytes = reb64.toString(CryptoJS.enc.Base64)
      const decrypt = CryptoJS.AES.decrypt(bytes, AppConfig.projectSecret)
      const plain = decrypt.toString(CryptoJS.enc.Utf8)

      if (typeof plain !== 'undefined' && plain != null && plain !== '') {
        response.content = plain
        response.isValid = true
      }
    } catch (exception) {
      log.debug('Exception at decoding QR-code:', exception)
    }

    return response
  }

  render () {
    return (
      <CameraComponent
        title='Scan QR-Code'
        usage='qr'
        onQRRead={this.validateQRCode.bind(this)}
        onQRValid={this.props.onQRValid}
        onQRInvalid={this.props.onQRInvalid}
        onBack={this.props.onBack}
      />
    )
  }
}
ScreenScanQRCode.propTypes = {
  onBack: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.func
  ]),
  onQRRead: PropTypes.func,
  onQRValid: PropTypes.func,
  onQRInvalid: PropTypes.func
}
ScreenScanQRCode.defaultProps = {
  onBack: false
}

export default ScreenScanQRCode
