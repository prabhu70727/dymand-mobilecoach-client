import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  AppState,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native'
import RNFS from 'react-native-fs'
import { RNCamera } from 'react-native-camera'

import HeaderBar from './HeaderBar'
import CameraButton from './Camera/CameraButton'
import PicturePreview from './Camera/PicturePreview'
import VideoPreview from './Camera/VideoPreview'
import { Colors } from './../Themes'
import AppConfig from '../Config/AppConfig'

import Log from './../Utils/Log'
const log = new Log('CameraComponent')

class CameraComponent extends Component {
  constructor (props) {
    super(props)
    this.initialState = {
      cameraFlashMode: RNCamera.Constants.FlashMode.off,
      cameraType: RNCamera.Constants.Type.back,
      videoIsRecording: false,
      picturePath: null,
      videoPath: null,
      audioPermissionsGranted: false,
      cameraPermissionsGranted: false,
      readBarcode: true,
      appState: AppState.currentState,
      bounds: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
      headerBarHeight: 0
    }
    this.state = this.initialState
  }

  componentDidMount () {
    if (Platform.OS === 'android') {
      log.info('Checking permissions for camera and audio usage on android devices.')
      this.checkAndRequestCameraPermisson()
    } else {
      log.info('Setting state for audio and camera permissions to true because Operating-System equals ios.')
      this.setState({audioPermissionsGranted: true, cameraPermissionsGranted: true})
    }

    /**
      * This Event-Listener is triggered when the app changes its state.
      * For example from inactive to active
      */
    AppState.addEventListener('change', this.appStateDidChange.bind(this))

    // Debug functionality
    if (this.props.usage === 'qr' && AppConfig.config.dev.fakeQRCodeScanWithURL != null) {
      setTimeout(() => { this.barcodeDetected({ 'data': AppConfig.config.dev.fakeQRCodeScanWithURL }) }, 1000)
    }
  }

  componentWillUnmount () {
    // Remove the Event-Listener for App-State change so that it will not be triggered anymore
    AppState.removeEventListener('change', this.appStateDidChange.bind(this))
  }

  /**
    * appStateDidChanged changes the components state
    * based on the current AppState
    */
  appStateDidChange (nextAppState) {
    if (nextAppState !== 'active') {
      this.camera = null
    }
    this.setState({appState: nextAppState})
  }

  /**
    * takePicture gets called when the user presses the "SNAP" button.
    * After the picture is processed the path to the image can be accessed over data.uri
    */
  async takePicture () {
    if (this.camera !== null) {
      log.info('Starting to take a picture.')
      const options = {
        width: 800,
        quality: 1,
        base64: false,
        fixOrientation: true,
        fixUpOrientation: true
      }
      try {
        const data = await this.camera.takePictureAsync(options)
        log.debug('Picture successfully saved: ', data.uri)
        this.setState({picturePath: data.uri})
      } catch (error) {
        log.error('Error while taking picture: ', error)
      }
    }
  }

  /**
    * takeVideo gets called when the useer presses the "RECORD" button.
    * takeVideo keeps recording until the user presses the "RECORD" button again.
    * this.camera.stopRecording() causes the Promise inside this.camera.recordAsync() to get resolved.
    * After recording has stopped the path to the video can be accessed through data.uri
    */
  async takeVideo () {
    if (this.camera !== null) {
      const options = {
        quality: RNCamera.Constants.VideoQuality['480p']
      }
      if (!this.state.videoIsRecording) {
        log.info('Starting to record video.')
        this.setState({ videoIsRecording: true })
        try {
          const data = await this.camera.recordAsync(options)
          log.debug('Video recorded. File is saved under: ', data.uri)
          this.setState({videoPath: data.uri})
        } catch (error) {
          Alert.alert(
            'Camera reagiert nicht',
            'Bitte schliesse alle Hintergrundanwendungen und versuche es noch einmal',
            [
              {text: 'OK', onPress: this.props.onClose}
            ]
          )
          log.warn('Error while recording video: ', error)
        }
      } else {
        log.info('Stopping to record video.')
        this.setState({ videoIsRecording: false })
        this.camera.stopRecording()
      }
    }
  }

  /**
    * barcodeDetected gets called when RNCamera reconizes a QR-Code.
    * If this.state.readBarcode equals true the barcode will be processed.
    * Afterward readBarcode-state will be set to false again.
    * Otherwise nothing will happen.
    *
    * QR-Code data can be accessed over response.data.
    */
  barcodeDetected (qrData) {
    const barCodeInRect = this.checkQrPosition(qrData.bounds)

    if (this.props.usage === 'qr' && this.state.readBarcode && barCodeInRect) {
      log.info('QR-Code detected: ', qrData)
      this.setState({readBarcode: false})
      const validationResultWithQRData = this.props.onQRRead(qrData)

      if (validationResultWithQRData.isValid === false) {
        log.info('QR-Code is not valid: ', qrData)
        this.props.onQRInvalid(validationResultWithQRData)
        this.setState({readBarcode: true})
      } else {
        log.info('QR-Code is valid: ', qrData)
        this.props.onQRValid(validationResultWithQRData)
      }
    }
  }

  checkQrPosition (bounds) {
    return true
  }

  /**
    * On android this function checks if the user granted permissions to access microphone and camera.
    * Otherwise the CameraComponent will not work as intened
    */
  async checkAndRequestCameraPermisson () {
    try {
      const audioPermissionsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
      const cameraPermissionsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)

      if (!audioPermissionsGranted) {
        log.debug('Audio permissions not granted. Permissions will be requested.')
        const audioPermissionUserChoice = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        if (audioPermissionUserChoice === PermissionsAndroid.RESULTS.GRANTED) {
          log.debug('Audio permissions granted by user')
          this.setState({audioPermissionsGranted: true})
        } else {
          log.debug('User has not granted Audio-Permissions. Video Recording will throw an error')
        }
      } else {
        log.debug('Audio permissions already granted.')
        this.setState({audioPermissionsGranted: true})
      }

      if (!cameraPermissionsGranted) {
        log.info('Camera permissions for camera and audi usage on android devices.')
        const cameraPermissionUserChoice = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        if (cameraPermissionUserChoice === PermissionsAndroid.RESULTS.GRANTED) {
          log.debug('Camera permissions granted by user')
          this.setState({cameraPermissionsGranted: true})
        } else {
          log.debug('User has not granted Camera-Permissions. Video Recording will throw an error')
        }
      } else {
        log.debug('Camera-Permissions already granted.')
        this.setState({cameraPermissionsGranted: true})
      }
    } catch (err) {
      log.error('Error while checking and requesting user permissions for video and audio: ', err)
    }
  }

  renderCameraView () {
    return (
      <View style={{flex: 1}}>
        <View onLayout={(event) => {
          if (Platform.OS === 'ios') {
            this.setState({headerBarHeight: event.nativeEvent.layout.height})
          } else {
            this.setState({headerBarHeight: event.nativeEvent.layout.height + StatusBar.currentHeight})
          }
        }}>
          <HeaderBar
            title={this.props.title}
            onBack={this.state.videoIsRecording ? false : this.props.onBack}
          />
        </View>
        <View style={styles.container}>
          <RNCamera
            ref={ref => {
              this.camera = ref
            }}
            style={styles.preview}
            captureAudio
            skipProcessing
            type={this.state.cameraType}
            flashMode={this.state.cameraFlashMode}
            barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
            onBarCodeRead={this.barcodeDetected.bind(this)}
          />
          {this.renderQrOverlay()}
          {this.renderCameraButton()}
        </View>
      </View>
    )
  }

  renderQrOverlay () {
    if (this.props.usage === 'qr') {
      const { width, height } = Dimensions.get('window')
      return (
        <View style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderColor: 'rgba(0,0,0,0.5)', borderLeftWidth: ((width - 200) / 2), borderRightWidth: ((width - 200) / 2), borderTopWidth: ((height - 200 - this.state.headerBarHeight) / 2), borderBottomWidth: ((height - 200 - this.state.headerBarHeight) / 2), alignItems: 'center', justifyContent: 'center'}}>
          <View style={{width: 200, height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <View style={{position: 'absolute', width: 40, height: 40, borderColor: Colors.main.hyperlink, borderTopWidth: 2, borderLeftWidth: 2, left: 0, top: 0}} />
            <View style={{position: 'absolute', width: 40, height: 40, borderColor: Colors.main.hyperlink, borderTopWidth: 2, borderRightWidth: 2, right: 0, top: 0}} />
            <View style={{position: 'absolute', width: 40, height: 40, borderColor: Colors.main.hyperlink, borderBottomWidth: 2, borderRightWidth: 2, right: 0, bottom: 0}} />
            <View style={{position: 'absolute', width: 40, height: 40, borderColor: Colors.main.hyperlink, borderBottomWidth: 2, borderLeftWidth: 2, left: 0, bottom: 0}} />
            <Text style={{color: Colors.main.hyperlink, opacity: 1}}> QR-CODE </Text>
          </View>
        </View>
      )
    }
  }

  renderCameraButton () {
    switch (this.props.usage) {
      case 'photo':
        return (
          <View style={{flex: 0, position: 'absolute', bottom: 15, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center'}}>
            <CameraButton
              onPress={this.takePicture.bind(this)}
              icon='radio-button-checked'
              buttonColor='rgb(255,255,255)'
            />
          </View>
        )
      case 'video':
        return (
          <View style={{flex: 0, position: 'absolute', bottom: 15, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center'}}>
            <CameraButton
              onPress={this.takeVideo.bind(this)}
              icon='radio-button-checked'
              buttonColor={this.state.videoIsRecording ? 'rgb(255,109,71)' : 'rgb(255,255,255)'}
            />
          </View>
        )
      default:
        return null
    }
  }

  async abortPicture (skipState = false) {
    log.debug('Trying to erase image from fs...')
    try {
      await RNFS.unlink(this.state.picturePath)
      log.info(`Image under ${this.state.picturePath} successfully erased.`)
      if (!skipState) {
        this.setState({picturePath: null})
      }
    } catch (err) {
      log.debug(`Error while trying to erase file under ${this.state.picturePath}`)
    }
  }

  async abortVideo (skipState = false) {
    log.debug('Trying to erase video...')
    try {
      await RNFS.unlink(this.state.videoPath)
      log.debug('Video erased.')
      if (!skipState) {
        this.setState({videoPath: null})
      }
    } catch (err) {
      log.debug('Error while trying to erase video', err)
    }
  }

  renderPermissionsNotGranted () {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <HeaderBar
          title={this.props.title}
          onBack={this.props.onBack}
          onClose={this.props.usage === 'qr' ? false : this.props.onClose}
          />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'white', padding: 15, alignSelf: 'center', textAlign: 'center', fontWeight: 'bold'}}> Die Applikation bennötigt die Berechtigung auf Ihre Camera und Ihr Mikrofon zuzugreifen </Text>
        </View>
      </View>
    )
  }

  render () {
    if (this.state.audioPermissionsGranted && this.state.cameraPermissionsGranted && this.state.appState === 'active') {
      if (this.state.picturePath === null && this.state.videoPath === null) {
        return (
          this.renderCameraView()
        )
      } else if (this.state.picturePath !== null) {
        return (
          <PicturePreview
            onConfirm={() => {
              this.props.onSubmitMedia(this.state.picturePath)
              this.props.onBack()
            }}
            onAbort={this.abortPicture.bind(this, false)}
            onBack={async () => {
              await this.abortPicture(true)
              this.props.onBack()
            }}
            imageSource={this.state.picturePath}
            title='Bild bestätigen'
          />
        )
      } else {
        return (
          <VideoPreview
            onConfirm={() => {
              this.props.onSubmitMedia(this.state.videoPath)
              this.props.onBack()
            }}
            onAbort={this.abortVideo.bind(this, false)}
            onBack={async () => {
              await this.abortVideo(true)
              this.props.onBack()
            }}
            source={this.state.videoPath}
            title='Video bestätigen'
          />
        )
      }
    } else if (!this.state.audioPermissionsGranted || !this.state.cameraPermissionsGranted) {
      return (
        this.renderPermissionsNotGranted()
      )
    }

    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <HeaderBar
          title={this.props.title}
          onBack={this.props.onBack}
          onClose={this.props.usage === 'qr' ? false : this.props.onClose}
          />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
})

CameraComponent.propTypes = {
  usage: PropTypes.string.isRequired,
  onClose: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool
  ]),
  onBack: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.bool
  ]),
  title: PropTypes.string,
  onQRRead: PropTypes.func,
  onQRInvalid: PropTypes.func,
  onQRValid: PropTypes.func,
  onSubmitMedia: PropTypes.func
}

CameraComponent.defaultProps = {
  onBack: false,
  onClose: false,
  usage: 'Photo',
  title: 'Kamera'
}

export default CameraComponent
