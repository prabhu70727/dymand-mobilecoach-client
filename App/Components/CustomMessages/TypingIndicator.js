import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Message } from 'react-native-gifted-chat'
import PropTypes from 'prop-types'
import Spinner from 'react-native-spinkit'
import { Colors } from '../../Themes'

export default class TypingIndicator extends Component {
  constructor (props) {
    super(props)

    this.typingMessage = {
      _id: 'typingIndicator',
      type: 'text',
      user: {
        _id: 2
      }
    }
  }

  static propTypes = {
    currentMessage: PropTypes.object,
    onPress: PropTypes.func
  }

  render () {
    return (
      <Message {...this.props} currentMessage={this.typingMessage} renderCustomView={this.renderCustomView} />
    )
  }

  renderCustomView () {
    const spinnerProps = {
      type: 'ThreeBounce',
      color: Colors.messageBubbles.left.font,
      isVisible: true,
      size: 28
    }
    return <Spinner {...spinnerProps} style={styles.spinner} />
  }
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20
  }
})
