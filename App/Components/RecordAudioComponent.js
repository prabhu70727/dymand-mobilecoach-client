import React, { Component } from 'react'
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  Animated
} from 'react-native'
import { AudioRecorder, AudioUtils } from 'react-native-audio'
import Sound from 'react-native-sound'
import Icon from 'react-native-vector-icons/MaterialIcons'
import RNFS from 'react-native-fs'

import HeaderBar from './HeaderBar'
import {Colors} from './../Themes'

import Log from './../Utils/Log'
const log = new Log('RecordAudioComponent')

class RecordAudioComponent extends Component {
  constructor (props) {
    super(props)

    this.initialState = {
      audioPermissionsGranted: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/',
      currentTime: 0.0,
      recordingFinished: false,
      isRecording: false,
      isPlaying: false,
      isPaused: false,
      blinkAnim: new Animated.Value(0)
    }
    this.state = this.initialState

    // Define path to audio-file
    this.audioFilePath = this.generateFileNameBasedOnTime()

    // Define recording and timer interval
    this.recording = null
    this.timerInterval = null

    // Define "Stop-Recording" animation
    this.blinkAnimationSequence = Animated.sequence([
      Animated.timing(
        this.state.blinkAnim,
        {
          toValue: 1,
          duration: 800
        }
      ),
      Animated.timing(
        this.state.blinkAnim,
        {
          toValue: 0,
          duration: 800
        }
      )
    ])
  }

  componentDidMount () {
    this.checkAndRequestCameraPermisson().then((permissionsGranted) => {
      this.setState({audioPermissionsGranted: permissionsGranted})
      if (permissionsGranted) {
        log.info('Audio permissions granted through user.')

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)})
        }

        AudioRecorder.onFinished = (data) => {
          if (Platform.OS === 'ios') {
            this.finishRecording(data.status === 'OK', data.audioFileURL)
          }
        }
      } else {
        log.info('User has not granted audio permissions.')
      }
    })
  }

  generateFileNameBasedOnTime () {
    const date = new Date()
    const timeStamp = date.getDate() + '' + date.getMonth() + '' + date.getFullYear() + '' + date.getHours() + '' + date.getMinutes() + '' + date.getSeconds()

    return (this.state.audioPath + timeStamp + '.aac')
  }

  async checkAndRequestCameraPermisson () {
    log.info('Checking permissions to access microphone.')

    if (Platform.OS === 'ios') {
      return true
    }

    const audioPermissionsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)

    if (!audioPermissionsGranted) {
      const audioRationale = {
        title: 'Microphone Permission',
        message: 'We need to get permissions to your microphone to record audio'
      }

      log.debug('Requesting audio permissions.')
      const audioPermissionUserChoice = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, audioRationale)
      return (audioPermissionUserChoice === PermissionsAndroid.RESULTS.GRANTED)
    }

    return true
  }

  finishRecording (recordingFinished, filePath) {
    this.setState({recordingFinished, currentTime: 0.0})

    if (recordingFinished) {
      log.debug('Successfully stoped system from recording audio file.')

      log.debug('Trying to prepare audio-file for playing...')
      try {
        this.recording = new Sound(filePath, '', (error) => {
          if (error) {
            log.debug('Sound file could not be prepared: ', error)
            return
          }

          log.debug('Sound file successfully prepared.')
        })
      } catch (err) {
        log.debug('Error while trying to prepare audio-file for playing', err)
      }
      log.info(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`)
    }
  }

  async startRecord () {
    if (!this.state.isRecording) {
      log.info('Starting to record audio-file...')
      this.loopBlinkAnimation()
      this.setState({isRecording: true, recordingFinished: false, currentTime: 0.0})
      this.prepareRecording()
      try {
        await AudioRecorder.startRecording()
      } catch (err) {
        log.debug('Error while trying to start record: ', err)
      }
    }
  }

  loopBlinkAnimation () {
    Animated.loop(this.blinkAnimationSequence).start()
  }

  prepareRecording () {
    AudioRecorder.prepareRecordingAtPath(this.audioFilePath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'Medium',
      AudioEncoding: 'aac'
    })
  }

  async stopRecord () {
    if (this.state.isRecording) {
      log.debug('Trying to stop system from recording audio file...')
      this.blinkAnimationSequence.stop()
      this.setState({isRecording: false})

      try {
        const filePath = await AudioRecorder.stopRecording()

        if (Platform.OS === 'android') {
          this.finishRecording(true, filePath)
        }
        return filePath
      } catch (err) {
        log.debug('Error while trying to stop system from recording: ', err)
      }
    }

    log.debug('The system is not recording at the moment')
  }

  async eraseRecord () {
    log.debug(`Trying to erase audio-file under: ${this.audioFilePath} ...`)
    try {
      if (await RNFS.exists(this.audioFilePath)) {
        await RNFS.unlink(this.audioFilePath)
        log.debug(`Successfully erased audio-file under: ${this.audioFilePaths}.`)
        this.recording.stop(() => {
          this.setState({recordingFinished: false, currentTime: 0.0, isPlaying: false, isPaused: false})
          this.audioFilePath = this.generateFileNameBasedOnTime()
        })
      } else {
        log.debug('No audio-file recorded. Component will close now.')
      }
    } catch (err) {
      log.debug(`Error while trying to erase audio-file under ${this.audioFilePath}: `, err)
    }
  }

  playRecord () {
    if (this.state.recordingFinished) {
      this.setState({isPlaying: true})

      if (!this.state.isPaused) {
        this.setState({currentTime: 0.0})
      }

      this.timerInterval = setInterval(this.timer.bind(this), 100)

      log.debug('Starting to play audio file.')
      this.recording.play((success) => {
        if (success) {
          this.setState({isPlaying: false, isPaused: false})
          clearInterval(this.timerInterval)
          log.debug('Audio-File successfully played.')
        } else {
          log.debug('Audio file could not be played.')
          this.recording.reset()
        }
      })
    } else {
      log.debug('There is no record available yet.')
    }
  }

  timer () {
    this.recording.getCurrentTime((seconds, isPlaying) => {
      this.setState({currentTime: Math.floor(seconds)})
    })
  }

  pauseRecord () {
    log.debug('Audio-File paused from playing')
    this.setState({isPlaying: false, isPaused: true})
    clearInterval(this.timerInterval)
    this.recording.pause()
  }

  renderRecordButton () {
    const AnimatedIcon = Animated.createAnimatedComponent(Icon)

    if (!this.state.isRecording) {
      return (
        <TouchableWithoutFeedback onPress={this.startRecord.bind(this)} >
          <View>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View>
                <Icon
                  name='radio-button-checked'
                  size={200}
                  style={{color: '#ffffff'}}
                />
              </View>
              <View style={{position: 'absolute'}}>
                <Text style={{fontWeight: 'bold', fontSize: 18, color: 'black'}}> {this.state.currentTime} s </Text>
              </View>
            </View>
            <View style={{alignSelf: 'center'}}>
              <Text style={{fontWeight: 'bold', fontSize: 14, color: 'white'}}> Press to record </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    } else {
      return (
        <TouchableWithoutFeedback onPress={this.stopRecord.bind(this)} >
          <View>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <View>
                <AnimatedIcon
                  name='radio-button-checked'
                  size={200}
                  style={{color: this.state.blinkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgb(255,255,255)', 'rgb(255,109,71)']
                  })}}
                />
              </View>
              <View style={{position: 'absolute'}}>
                <Text style={{fontWeight: 'bold', fontSize: 18, color: 'black'}}> {this.state.currentTime} s </Text>
              </View>
            </View>
            <View style={{alignSelf: 'center'}}>
              <Text style={{fontWeight: 'bold', fontSize: 14, color: 'white'}}> Press to stop </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    }
  }

  renderPlayButton () {
    return (
      <TouchableWithoutFeedback style={{padding: 20}} onPress={!this.state.isPlaying ? this.playRecord.bind(this) : this.pauseRecord.bind(this)} >
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <View>
            <Icon
              name={this.state.isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={200}
              style={{color: '#ffffff'}}
            />
          </View>
          <View>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: 'white'}}> {this.state.currentTime} s </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderFooterBar () {
    if (this.state.recordingFinished) {
      return (
        <View style={{flexDirection: 'row', position: 'absolute', bottom: 0}}>
          <TouchableWithoutFeedback onPress={this.eraseRecord.bind(this)} style={{}}>
            <View style={{paddingHorizontal: 25}}>
              <Icon
                name={'cancel'}
                size={60}
                style={{color: 'rgb(255,109,71)'}}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.submitRecord.bind(this)}>
            <View style={{paddingHorizontal: 25}}>
              <Icon
                name={'check-circle'}
                size={60}
                style={{color: 'rgb(60, 255, 118)'}}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      )
    }

    return null
  }

  submitRecord () {
    this.props.onSubmitMedia(this.audioFilePath)
    this.props.onClose()
  }

  render () {
    if (this.state.audioPermissionsGranted) {
      return (
        <View style={{flex: 1, backgroundColor: Colors.main.grey1}}>
          <HeaderBar
            title='Record Audio'
            onBack={async () => {
              await this.eraseRecord()
              this.props.onClose()
            }}
          />

          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20}}>
            {!this.state.recordingFinished ? this.renderRecordButton() : this.renderPlayButton()}
          </View>

          <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: 20}}>
            {this.renderFooterBar()}
          </View>
        </View>
      )
    }
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <HeaderBar
          title='Record Audio'
          onBack={this.props.onClose}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold', textAlign: 'center' }}> You need to give permissions to access your microphone </Text>
        </View>
      </View>
    )
  }
}

export default RecordAudioComponent
