import React, { Component } from 'react'
import { Modal } from 'react-native'

import AddMealContainer from './AddMealModule/AddMealContainer'
import FoodDiary from './FoodDiary/FoodDiary'
import WebRichContent from '../Components/WebRichContent'
import WebViewContent from '../Components/WebViewContent'
import Lightbox from '../Components/Lightbox'
import FullscreenVideo from '../Components/Video/FullscreenVideo'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Animatable from 'react-native-animatable'

import FeedbackForm from './Settings/FeedbackForm'

import ServerMessageActions from '../Redux/MessageRedux'
import GUIActions from '../Redux/GUIRedux'

// In specific cases, using the real Modal can cause issues.
// E.g. when using panResponder (see: https://github.com/facebook/react-native/issues/14295)
// When useFakeModal is set, a View-Component is used instead.
const fakeModalTypes = ['image-lightbox']

class ModalContent extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    // General Type of the modal content (e.g. 'rich-content')
    type: PropTypes.string,
    // Function to be called when Modal is closed
    onClose: PropTypes.func,
    // Function to set Demo-Dialogue state
    setDemoDialogueState: PropTypes.func,
    // Any other data / functions we might need for a custom modal
    content: PropTypes.object
  }

  // TODO: can be deleted?
  onSend = (messages = []) => {
    if (!Array.isArray(messages)) {
      console.warn('onSend wants an array')
    }
    messages.forEach(msg => {
      // Send the textmessage to server
      this.props.sendMessageToServer(msg.text, msg.text)
    })
  }

  // TODO: Maybe theres a more perfomant way?
  componentWillReceiveProps (nextProps) {
    // We only need to update disableGestures manually for fakeModal-Screens,
    // on the real modal we can use onShow / onDismiss
    if (fakeModalTypes.includes(nextProps.type)) {
      if (nextProps.visible) this.props.disableSidemenuGestures()
      else this.props.enableSidemenuGestures()
    }
  }

  render () {
    if (fakeModalTypes.includes(this.props.type)) return this.renderFakeModal()
    else return this.renderModal()
  }

  renderFakeModal () {
    if (this.props.visible) {
      return (
        <Animatable.View animation='fadeIn' duration={350} style={{zIndex: 100, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
          {this.renderContent()}
        </Animatable.View>
      )
    } else return null
  }

  renderModal () {
    return (
      <Modal
        onShow={() => { this.props.disableSidemenuGestures() }}
        onDismiss={() => { this.props.enableSidemenuGestures() }}
        animationType={'fade'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => { this.props.onClose() }} // for android
      >
        {this.renderContent()}
      </Modal>
    )
  }

  renderContent () {
    switch (this.props.type) {
      case 'rich-text':
        return (
          <WebRichContent onClose={this.props.onClose}>
            {this.props.content.htmlMarkup}
          </WebRichContent>
        )
      case 'web':
        return (
          <WebViewContent onClose={this.props.onClose}>
            {this.props.content.url}
          </WebViewContent>
        )
      case 'add-meal':
        return (<AddMealContainer
          mealType={this.props.content.mealType}
          onPress={this.props.onClose}
              />)
      case 'food-diary':
        return (<FoodDiary
          onPress={this.props.onClose}
              />)
      case 'image-lightbox':
        return (<Lightbox
          source={this.props.content.source}
          onClose={this.props.onClose}
              />)
      case 'fullscreen-video':
        return (<FullscreenVideo
          videoPlayer={this.props.content.videoPlayer}
          source={this.props.content.source}
          initialPosition={this.props.content.initialPosition}
          paused={this.props.content.paused}
          closeFullscreenCallback={this.props.content.closeFullscreenCallback}
          onClose={this.props.onClose}
              />)
      case 'feedback-form':
        return (<FeedbackForm
          onSubmit={(name, email, feedback) => {
            this.props.content.onSubmit(name, email, feedback)
            this.props.onClose()
          }}
          onClose={this.props.onClose}
              />)
      default: return null
    }
  }
}

const mapStateToDispatch = dispatch => ({
  sendMessageToServer: (text, value, relatedMessageId = null) => dispatch(ServerMessageActions.sendMessage(text, value, relatedMessageId)),
  enableSidemenuGestures: () => dispatch(GUIActions.enableSidemenuGestures()),
  disableSidemenuGestures: () => dispatch(GUIActions.disableSidemenuGestures())
})

export default connect(null, mapStateToDispatch)(ModalContent)
