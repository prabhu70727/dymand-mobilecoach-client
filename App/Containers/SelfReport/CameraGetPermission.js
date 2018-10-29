import React, {Component} from 'react'
import { PermissionsAndroid } from 'react-native';
import { connect } from 'react-redux'


import Log from '../../Utils/Log'
const log = new Log('CameraGetPermission')

class CameraGetPermission extends Component {

    componentDidMount() {
        log.debug("componentDidMount called")
        requestCameraPermission()
        requestAudioPermission() // If you need to record audio.
    }

    render () {
        return null;
    }
}

async function requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          'title': 'Camera Permission',
          'message': 'Dymand App needs access to your camera '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        log.debug("You can use the camera")
      } else {
        log.debug("Camera permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  async function requestAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          'title': 'Audio Permission',
          'message': 'Dymand App needs access to your audio'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        log.debug("You can use the camera")
      } else {
        log.debug("Camera permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }


  export default connect(null, null)(CameraGetPermission)