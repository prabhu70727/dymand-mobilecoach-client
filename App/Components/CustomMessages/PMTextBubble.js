import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'
import { Bubble } from 'react-native-gifted-chat'
import { MessageStates } from '../../Redux/MessageRedux'
// import Log from '../../Utils/Log'
// const log = new Log('Components/PMTextBubble')

export default class PMTextBubble extends Component {
  static propTypes = {
    currentMessage: PropTypes.object
  }

  // Checks if chat-bubble should be animated or not
  bubbleShouldBeAnimated () {
    const { currentMessage } = this.props.chatProps
    return (currentMessage.user._id === 1 && currentMessage.custom.clientStatus === MessageStates.PREPARED_FOR_SENDING &&
      (currentMessage.custom.mediaType !== 'video' &&
      currentMessage.custom.mediaType !== 'image' &&
      currentMessage.custom.mediaType !== 'audio'))
  }

  render () {
    const {chatProps} = this.props
    // If the Message is a user message, and it has just has been sent, check if there should be an fadeIn-Animation
    if (this.bubbleShouldBeAnimated()) {
      return (
        <Animatable.View useNativeDriver animation={this.props.appearInAnimationLeft} duration={350}>
          <Bubble {...chatProps}
            wrapperStyle={this.props.wrapperStyle}
            textStyle={this.props.textStyle}
          />
        </Animatable.View>
      )
    } else {
      return (
        <Bubble {...chatProps}
          wrapperStyle={this.props.wrapperStyle}
          textStyle={this.props.textStyle}
        />
      )
    }
  }
}
