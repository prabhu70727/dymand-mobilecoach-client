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

  render () {
    const {chatProps} = this.props
    const {currentMessage} = chatProps
    // If the Message is a user message, and it has just has been sent, check if there should be an fadeIn-Animation
    if (currentMessage.user._id === 1) {
      return (
        <Animatable.View useNativeDriver animation={(currentMessage.custom.clientStatus === MessageStates.PREPARED_FOR_SENDING) ? this.props.appearInAnimationLeft : null} duration={350}>
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
