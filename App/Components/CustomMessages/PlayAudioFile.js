import React, { Component } from 'react'
import { StyleSheet, View, Dimensions, TouchableOpacity, Animated, Easing, ActivityIndicator, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Sound from 'react-native-sound'
// import I18n from '../../I18n/I18n'
import {inputMessageStyles} from './Styles/CommonStyles'
import RNFS from 'react-native-fs'
import Common from '../../Utils/Common'

import {Colors} from '../../Themes/'

import Log from '../../Utils/Log'
const log = new Log('Components/CustomMessages/PlayAudioFile')

export default class PlayAudioFile extends Component {
  constructor (props) {
    super(props)
    this.initialState = {
      audioIsPlaying: false,
      audioProgress: 0,
      inputWidth: 0,
      progressIndicatorPosition: 0,
      progressbarIndicatorPosition: new Animated.Value(0),
      initialized: false
    }

    this.state = this.initialState
    this.progressbarWidth = 0
    this.progressbarIndicatorAnimationDuration = 0
    this.progressbarAnimation = null
  }

  // this.audioFile = new Sound(this.props.source, '', (err) => log.warn(err))
  componentWillMount () {
    const {source} = this.props
    // Check if it's a local or remote/web file
    // if it's a web url...
    let urlPattern = /^https?:\/\//i
    if (urlPattern.test(source)) {
      // ...check if there is a cached version of the audiofile
      const cacheManager = Common.getImageCacheManager()
      cacheManager.queryUrl(source).then(result => {
        // if the url record isn't cached, just use the url as source
        if (result === null) {
          log.info('Initialized audio using web-version from url: ' + source)
          this.audioFile = new Sound(source, '', this.initialize.bind(this))
        // if there is a cached version, use to local file!
        } else {
          log.info('Retrieved audio file from local cache: ' + source)
          this.audioFile = new Sound(result, '', this.initialize.bind(this))
        }
      })
    } else {
      // if it's a local file, check if the filepath exists...
      RNFS.exists(source)
      .then((exists) => {
        if (exists) {
          // ...set the source instantly
          log.info('Initialized audio from local source: ', source)
          this.audioFile = new Sound(source, '', this.initialize.bind(this))
        } else {
          // If the file doesn't exist, find the absolute file-path first
          if (Platform.OS === 'ios') {
            log.warn('Requested audio file could not be found: ' + source)
          // on android, the video needs to be decompressed first
          // TODO: Maybe it's possible to use the Android Expansion File for this? -> see: https://github.com/react-native-community/react-native-video#android-expansion-file-usage
          } else if (Platform.OS === 'android') {
            // destination path for uncompressed audio, this will be overridden each time
            const dest = `${RNFS.DocumentDirectoryPath}/tempAudio.aac`
            // decompress and copy to destination...
            RNFS.copyFileAssets(source, dest)
              .then(() => {
                // then open the PDF
                log.info('Initialized audio after decompressing to local source: ' + source)
                this.audioFile = new Sound(dest, '', this.initialize.bind(this))
              })
              .catch((error) => {
                log.warn('Could not decompress audio-file from local android assets:' + error.toString())
              })
          }
        }
      })
    }
  }

  // The error callback can also be used as success callback,
  // see: https://github.com/zmxv/react-native-sound/issues/155
  initialize (err) {
    // Error case
    if (err) {
      log.debug('failed to load the sound: ' + err.toString())
      return
    }
    // success case
    this.setState({initialized: true})
  }

  // Plays Audio-File defined in this.audioPath
  onPlayAudio () {
    if (this.audioFile.isLoaded()) {
      if (this.progressbarAnimation === null) {
        // Set the duration of the animation.
        // Duration has to multiplied by 1000 because Sound.getDuration() returns seconds and we want to have milli-seconds
        this.progressbarIndicatorAnimationDuration = this.audioFile.getDuration() * 1000
        this.progressbarAnimation = Animated.timing(
          this.state.progressbarIndicatorPosition, {
            // Subtrach the size of the progressbar-indicator
            toValue: this.progressbarWidth - 16,
            duration: this.progressbarIndicatorAnimationDuration,
            useNativeDriver: true,
            easing: Easing.linear
          }
        )
      }

      // Start the progressbar-animation
      this.progressbarAnimation.start()

      // Set audioIsPlaying-state to true and play audio-file
      this.setState({audioIsPlaying: true})
      this.audioFile.play(() => {
        this.progressbarAnimation = null
        this.setState({progressbarIndicatorPosition: new Animated.Value(0), audioIsPlaying: false})
      })
    }
  }

  // Stops the audio-file from playing and resets the progressbar-indicator position
  onStopAudio () {
    if (this.state.audioIsPlaying) {
      // Stop playing audio-file
      this.audioFile.stop(() => {
        // Reset progressbarAnimation
        this.progressbarAnimation = null
        // Reset progressbar-indicator-position to 0 and set audioIsPlaying to false
        this.setState({progressbarIndicatorPosition: new Animated.Value(0), audioIsPlaying: false})
      })
    }
  }

  // Measure width of hidden Text element to adjust input width
  measureView (event) {
    this.setState(
      {
        inputWidth: event.nativeEvent.layout.width
      }
    )
  }

  // Sets progressbar-width for animation
  getprogressbarWidth (event) {
    const { width } = event.nativeEvent.layout
    this.progressbarWidth = width
  }

  renderLoadingOverlay () {
    if (!this.state.initialized) {
      return (
        <View style={[inputMessageStyles.mediaContent, {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)'}]}>
          <ActivityIndicator />
        </View>
      )
    } else return null
  }

  render () {
    // Get window with to set view-width to window-width.
    // Substract 50 because of distance to the left (Normal Bubble has marginLeft: 50)
    const { width } = Dimensions.get('window')
    return (
      <View style={[styles.inputBubble, {width: width - 50}]}>
        <TouchableOpacity onPress={this.state.audioIsPlaying ? this.onStopAudio.bind(this) : this.onPlayAudio.bind(this)}>
          <View>
            <Icon name={this.state.audioIsPlaying ? 'stop' : 'play-arrow'} type='ionicon' color={'white'} size={30} />
          </View>
        </TouchableOpacity>
        <View style={styles.progressbarContainer}>
          <View onLayout={this.getprogressbarWidth.bind(this)} style={styles.progressbar} />
          <Animated.View style={[styles.progressbarIndicator, { transform: [{translateX: this.state.progressbarIndicatorPosition}] }]} />
        </View>
        {this.renderLoadingOverlay()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inputBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  progressbarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 5
  },
  progressbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.playAudio.progressbarBackground
  },
  progressbarIndicator: {
    position: 'absolute',
    height: 16,
    width: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
    left: 0
  }
})
