import React, { Component } from 'react'
import { View, Platform, ActivityIndicator } from 'react-native'
import RNFetchBlob from 'react-native-fetch-blob'
import RNFS from 'react-native-fs'
import PropTypes from 'prop-types'
import {Metrics, Colors} from '../../Themes/'
import BottomControls from './BottomControls'
import VideoPlayer from 'react-native-true-sight'
import Common from '../../Utils/Common'

import Log from '../../Utils/Log'
const log = new Log('CustomMessages/ChatVideo')

export default class Video extends Component {
  /*
   * Supported source prop formats:
   *  1. full web-url, e.g.: 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
   *  2. local file path relative from web folder, e.g. 'assets/video/video.mp4'
   *  window.postMessage('complete');
   */
  static propTypes = {
    source: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    onToggleFullscreen: PropTypes.func,
    fullscreenMode: PropTypes.bool,
    initialPosition: PropTypes.number,
    autoStart: PropTypes.bool,
    useIOSNativeFullscreen: PropTypes.bool
  }
  static defaultProps = {
    initialPosition: 0,
    autoStart: false
  }
  constructor (props) {
    super(props)
    this.state = {
      source: null
    }
    this.getCurrentTime = () => this.refs.player.getCurrentTime()
    this.getPaused = () => this.refs.player.getPaused()
  }

  componentWillMount () {
    const {source} = this.props

    // Check if it's a local or remote/web file
    // if it's a web url...
    let urlPattern = /^https?:\/\//i
    if (urlPattern.test(source)) {
      // ...check if there is a cached version of the video
      const cacheManager = Common.getImageCacheManager()
      cacheManager.queryUrl(source).then(result => {
        // if the video url isn't cached, just use the url as source
        if (result === null) {
          this.setState({source})
        // if there is a cached version, use to local file!
        } else {
          this.setState({source: result})
        }
      })
    } else {
      // if it's a local file, check if the filepath exists...
      RNFS.exists(source)
      .then((exists) => {
        if (exists) {
          // ...set the source instantly
          this.setState({source})
        } else {
          // If the file doesn't exist, find the absolute file-path first
          if (Platform.OS === 'ios') {
            this.baseDir = RNFetchBlob.fs.dirs.MainBundleDir + source
            // on android, the video needs to be decompressed first
            // TODO: Maybe it's possible to use the Android Expansion File for this? -> see: https://github.com/react-native-community/react-native-video#android-expansion-file-usage
          } else if (Platform.OS === 'android') {
            // destination path for uncompressed video, this will be overridden each time
            const dest = `${RNFS.DocumentDirectoryPath}/tempVideo.mp4`
            // decompress and copy to destination...
            RNFS.copyFileAssets(source, dest)
              .then(() => {
                // then open the PDF
                this.setState({source: dest})
              })
              .catch((err) => {
                log.warn('Could not uncompress video from local android assets: ' + err.toString())
              })
          }
        }
      })
    }
  }

  render () {
    let width = this.props.width
    let height = this.props.height
    if (!height) height = 0.5625 * width
    if (this.props.fullscreenMode) {
      width = Metrics.screenWidth
      height = Metrics.screenHeight - 40
    }
    return (
      <View style={{ width: width, height: height, backgroundColor: 'black' }}>
        {this.renderVideo()}
      </View>
    )
  }

  // Callback to be handled when fullscreen is closed
  closeFullscreenCallback (currentTime, paused) {
    this.refs.player.setPosition(currentTime)
    if (!paused) this.refs.player.setPlaying()
  }

  renderVideo () {
    if (this.state.source) {
      const bottomControls = (props) => <BottomControls {...props} />
      // TODO: Maybe we can pull things out of render for performance
      let onToggleFullscreen = () => {
        let paused = this.refs.player.getPaused()
        // Pause current player
        this.refs.player.setPaused()
        // then call fullscreen callback with current time
        this.props.onToggleFullscreen(this.state.source, this.refs.player.getCurrentTime(), paused, (currentTime, paused) => this.closeFullscreenCallback(currentTime, paused))
      }
      // If useIOSNativeFullscreen is set, override fullscreen-callback with openplayer function
      if (this.props.useIOSNativeFullscreen && Platform.OS === 'ios') {
        onToggleFullscreen = () => this.refs.player.openIOSFullscreenPlayer()
      }
      let controlProps = {
        onToggleFullscreen,
        inFullscreen: this.props.fullscreenMode
      }
      return (
        <VideoPlayer
          ref='player'
          bottomControlsBar={bottomControls}
          autoStart={this.props.autoStart}
          source={this.state.source}
          initialPosition={this.props.initialPosition}
          middleControlsBarProps={controlProps}
        />
      )
    } else {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color={Colors.activityIndicator} />
        </View>
      )
    }
  }
}
