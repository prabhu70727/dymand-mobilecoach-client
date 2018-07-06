/**
 * Wrapper Class for GiftedChat-Bubble which removes all possible special-Views (e.g. Text, Time).
 * This can be used as as a blank Bubble-Wrapper, e.g. for Custom Bubbles like 'open-component' where you don't
 * want anything displayed but your custom-view.
**/

import React, { Component } from 'react'
import { Bubble } from 'react-native-gifted-chat'
import PropTypes from 'prop-types'

export default class BlankBubble extends Component {
  static propTypes = {
    renderTime: PropTypes.bool,
    renderText: PropTypes.bool
  }
  static defaultProps = {
    renderTime: false,
    renderText: false
  }

  render () {
    // let containerStyle
    // if the avatar should not be rendered, also some margins need to be removed
    // if (!this.props.renderAvatar) containerStyle = {left: {marginLeft: 0, marginBottom: 2, marginRight: 0}, right: {marginLeft: 0, marginBottom: 2, marginRight: 0}}
    return (
      <Bubble
        {...this.props}
        renderTime={this.props.renderTime ? undefined : () => null}
        renderMessageText={this.props.renderText ? undefined : () => null}
        wrapperStyle={styles.wrapperStyle}
      />
    )
  }
}

const styles = {
  wrapperStyle: {
    left: {
      backgroundColor: 'transparent',
      alignSelf: 'stretch',
      marginRight: 0
    },
    right: {
      backgroundColor: 'transparent',
      alignSelf: 'stretch',
      marginLeft: 0
    }
  }
}
