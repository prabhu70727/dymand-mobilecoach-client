import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Button from 'react-native-button'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'
import { Bubble } from 'react-native-gifted-chat'
import I18n from '../../I18n/I18n'
import * as Progress from 'react-native-progress'
import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import Common from '../../Utils/Common'

import {Colors} from '../../Themes/'
import { TextBubbleStyle } from './../../Containers/Chat/Styles'
import {inputMessageStyles} from './Styles/CommonStyles'
import ChatImage from './ChatImage'
import ChatVideo from './ChatVideo'
import PlayAudioFile from './PlayAudioFile'
import Ticks from './Ticks'
import ServerMessageRedux, {MessageStates} from './../../Redux/MessageRedux'
import { uploadMediaInput } from '../../Sagas/ServerSyncSagas'

import Log from '../../Utils/Log'
const log = new Log('Components/CustomMessages/MediaInput')

const convertedFilePath = function (path) {
  let fsPath = path
  if (path.startsWith('file://')) fsPath = path.substring(7)
  return fsPath
}

class MediaInput extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onSubmit: PropTypes.func,
    setAnimationShown: PropTypes.func,
    type: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    let mediaFileIsUploading = false
    let submitted = false
    let initialized = true
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
    this.mediaPath = ''
    // If uploadPath is set (Media was recorded already, but not uploaded),
    // check if file still exists (see componentDidMount) befire initialization
    if (props.currentMessage.custom.uploadPath) {
      initialized = false
    }
    this.state = {
      initialized,
      mediaFileIsUploading,
      submitted,
      progress: 0
    }

    // Which Media-Type should be displayed
    switch (props.type) {
      case 'image': {
        this.modal = 'take-photo'
        this.buttonTitle = I18n.t('Common.takePhoto')
        this.icon = 'ios-camera'
        break
      }
      case 'audio': {
        this.modal = 'record-audio'
        this.buttonTitle = I18n.t('Common.recordAudio')
        this.icon = 'ios-microphone'
        break
      }
      case 'video': {
        this.modal = 'record-video'
        this.buttonTitle = I18n.t('Common.recordVideo')
        this.icon = 'ios-videocam'
        break
      }
    }

    // Fake Chat-Message to use Chat-Bubble for uploading state
    this.fakeMessage = {
      custom: {
        clientStatus: MessageStates.UPLOADING_MEDIA_CONTENT
      },
      createdAt: Date.now(),
      user: {
        _id: 1
      },
      text: ' '
    }
  }

  componentWillMount () {
    const {uploadPath} = this.props.currentMessage.custom
    const {fs} = RNFetchBlob
    // If uploadPath is set (Media was recorded already, but not uploaded)...
    if (uploadPath) {
      // ...check if old mediaPath still exists
      fs.exists(convertedFilePath(uploadPath))
        .then((exist) => {
          // if it exists, use it as mediaPath
          if (exist) {
            this.mediaPath = uploadPath
            this.setState({submitted: true, mediaFileIsUploading: false, initialized: true})
          // if it doesn't exist, clear mediaPath and display record Button again..
          } else {
            log.info(`Could not find media-object at path ${uploadPath} stored in server message ${this.props.currentMessage._id}. Displaying record Button again.`)
            this.mediaPath = ''
            this.setState({submitted: false, mediaFileIsUploading: false, initialized: true})
          }
        })
        // if an error occured, log a warning and show initial record button
        .catch((e) => {
          log.warn('Error occured while trying to check for file existence at uploadMedia Message ' + this.props.currentMessage._id + ': ' + e.toString())
        })
    }
  }

  componentDidMount () {
    // Notify redux that animationw as shown after first render
    const {currentMessage} = this.props
    if (currentMessage.custom.shouldAnimate) {
      this.props.setAnimationShown(currentMessage._id)
    }
  }

  onSubmitHandler () {
    // Only submit if mediaPath was set!
    if (this.mediaPath !== '') {
      // Update state and start upload afterwards
      this.setState({submitted: true, mediaFileIsUploading: true}, this.uploadMedia.bind(this))
    }
  }

  uploadMedia () {
    const {currentMessage, onSubmit, messageMediaUploading} = this.props
    let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
    messageMediaUploading(relatedMessageId, this.mediaPath)

    // let mediaUrl = 'https://redux-saga.js.org/docs/advanced/Testing.aac'
    // Common.cacheLocalMedia(mediaUrl, this.mediaPath, (this.modal === 'take-photo')).then(() => {
    //   // After caching, send answer message to server
    //   log.info(`Successfully cached local file: ${this.mediaPath.toString()}.`)
    // }).catch((e) => {
    //   log.warn(`Error while caching local file: ${e.toString()}. Proceeding without caching.`)
    // }).finally(() => onSubmit('answer-to-server-visible', '', mediaUrl, relatedMessageId, mediaUrl))

    // Upload media to server
    uploadMediaInput(this.props.type, currentMessage.custom.uploadVariable, this.mediaPath,
    // 1. Success Callback:
    (mediaUrl) => {
      log.debug('Upload successful')
      // Cache local file related to remote URL
      // Params: remote url, local url, create thumbnail (bool) -> only for images!
      Common.cacheLocalMedia(mediaUrl, this.mediaPath, (this.modal === 'take-photo')).then((filepath) => {
        // After caching, send answer message to server
        // Cleanup: remove local file (from now on, file in cached folder will be used)
        Common.deleteLocalFile(this.mediaPath).then(() => {
          log.info('Temporary file removed successfully.')
        }).catch((e) => log.warn('Error while trying to remove temporary file: ' + e.toString()))
        log.info(`Successfully cached local file to path: ${this.mediaPath}.`)
      }).catch((e) => {
        log.warn(`Error while caching local file: ${e.toString()}. Proceeding without caching.`)
      }).finally(() => onSubmit('answer-to-server-visible', '', mediaUrl, relatedMessageId, mediaUrl))
    // 2. Progress Callback
    }, (progress) => {
      log.debug('Upload progress:', progress)
      this.setState({progress})
    // 3. Upload Fail Callback
    }, () => {
      log.debug('Upload failed')
      this.setState({mediaFileIsUploading: false, progress: 0})
    })
  }
  // Shows screen to record audio/video or to take a picture
  showModalScreen () {
    const { showModal } = this.props
    showModal(this.modal, {onSubmitMedia: (mediaPath) => this.setMediaPath(mediaPath)}, () => this.onSubmitHandler())
    return null
  }

  // Sets the media path to access file inside of the chat
  setMediaPath (mediaPath) {
    this.mediaPath = mediaPath
  }

  // Component which should be displayed inside of the Chat-Bubble while file is uploading
  renderUploadPreview () {
    switch (this.modal) {
      case 'take-photo':
        return (
          <ChatImage
            showModal={this.props.showModal}
            source={this.mediaPath}
            position={this.props.position}
          />
        )
      case 'record-video':
        return (
          <ChatVideo
            showModal={this.props.showModal}
            source={this.mediaPath}
            position={this.props.position}
          />
        )
      case 'record-audio':
        return (
          <PlayAudioFile
            source={this.mediaPath}
            position={this.props.position}
          />
        )
    }
  }

  renderUploadProgress () {
    if (this.state.mediaFileIsUploading) {
      // For audio uploads, use progress bar (circle is too big)
      if (this.modal === 'record-audio') {
        return (
          <Progress.Pie
            size={30}
            color={Colors.messageBubbles.right.progressIndicator}
            progress={this.state.progress}
          />
        )
      }
      return (
        <Progress.Circle
          size={80}
          color={Colors.messageBubbles.right.progressIndicator}
          progress={this.state.progress}
          showsText
        />
      )
    } else {
      return (
        <TouchableOpacity
          style={{flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center'}}
          onPress={() => this.onSubmitHandler()}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name='file-upload' type='material' color={Colors.buttons.common.disabled} size={30} />
            <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 10}}> {I18n.t('Common.retry')} </Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  renderPreview () {
    return (
      <View style={{position: 'relative'}}>
        {this.renderUploadPreview()}
        <View style={[inputMessageStyles.mediaContent, {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)'}]}>
          {this.renderUploadProgress()}
        </View>
      </View>
    )
  }

  // Tick that will be displayed ehile uploading media file
  renderTicks () {
    return (
      <Ticks currentMessage={this.fakeMessage} />
    )
  }

  render () {
    // When media file is uploading show Chat-Bubble with uploading state
    if (this.state.initialized) {
      if (this.state.submitted) {
        return (
          <Bubble
            user={{_id: 1}}
            currentMessage={this.fakeMessage}
            renderMessageText={this.renderPreview.bind(this)}
            position='right'
            locale={I18n.locale}
            timeFormat='LT'
            dateFormat='LL'
            wrapperStyle={TextBubbleStyle.wrapperStyle}
            textStyle={{right: {...TextBubbleStyle.textStyle.right}}}
            onLongPress={() => null}
            renderTicks={this.renderTicks.bind(this)}
          />
        )
      // Otherwise show normal Chat-Bubble to access Modal-Screen
      } else {
        return (
          <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={[inputMessageStyles.container]} onAnimationEnd={() => { this.shouldAnimate = false }} >
            <View style={styles.inputBubble}>
              <Button
                onPress={() => this.showModalScreen()}>
                <Icon name={this.icon} type='ionicon' color={Colors.buttons.common.text} size={30} />
                <Text style={{color: Colors.buttons.common.text, fontWeight: 'bold', marginLeft: 10}}> {this.buttonTitle} </Text>
              </Button>
            </View>
          </Animatable.View>
        )
      }
    } else return null
  }
}

const mapStateToDispatch = dispatch => ({
  messageMediaUploading: (relatedMessageId, uploadPath) => dispatch(ServerMessageRedux.messageMediaUploading(relatedMessageId, uploadPath))
})

export default connect(null, mapStateToDispatch)(MediaInput)

const styles = StyleSheet.create({
  inputBubble: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    minHeight: 35,
    borderRadius: 16,
    borderTopRightRadius: 3,
    backgroundColor: Colors.buttons.common.background,
    marginBottom: 4
  }
})
