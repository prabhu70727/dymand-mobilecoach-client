/**
 * Wrapper Class for GiftedChat-Message which removes all possible special-Views (e.g. Avatar, Time, Date, etc.).
 * This can be used as as a blank Message-Wrapper, e.g. for Custom Messages like 'open-component' where you don't
 * want anything displayed but your custom-view.
**/

import React, { Component } from 'react'
import { Message } from 'react-native-gifted-chat'
import PropTypes from 'prop-types'

export default class BlankMessage extends Component {
  static propTypes = {
    renderDate: PropTypes.bool,
    renderAvatar: PropTypes.bool
  }
  static defaultProps = {
    renderDate: false,
    renderAvatar: false
  }

  render () {
    let containerStyle
    // if the avatar should not be rendered, also some margins need to be removed
    if (!this.props.renderAvatar) containerStyle = {left: {marginLeft: 0, marginBottom: 2, marginRight: 0}, right: {marginLeft: 0, marginBottom: 2, marginRight: 0}}
    return (
      <Message
        {...this.props}
        renderAvatar={this.props.renderAvatar ? undefined : null}
        renderDay={this.props.renderDate ? null : () => null}
        containerStyle={containerStyle}
      />
    )
  }
}
