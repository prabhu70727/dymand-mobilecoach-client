import React, {Component} from 'react'
import {Text, StyleSheet, View} from 'react-native'
import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'

import LoadingOverlay from './LoadingOverlay'
import { Colors } from '../Themes/'

export default class EmptyChatIndicator extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    emptyChatMessage: PropTypes.string
  }

  static defaultProps = {
    emptyChatMessage: ''
  }

  constructor (props) {
    super(props)
    this.state = {
      shouldRender: false
    }
  }

  componentDidMount () {
    if (this.props.active) {
      this.startTimerToShow()
    }
  }

  componentWillUnmount () {
    this.stopTimerAndHide()
  }

  // Always wait 500 ms before showing indicator to prevent indicator from flashing on startup
  startTimerToShow () {
    // check for timeoutID to ensure only one timer is running
    if (!this.timeoutID) {
      this.timeoutID = setTimeout(() => {
        this.timeoutID = null
        this.setState({ shouldRender: true })
      }, 500)
    }
  }

  stopTimerAndHide () {
    clearTimeout(this.timeoutID)
    this.timeoutID = null
    // Fade out Animation
    if (this.refs.view) this.refs.view.fadeOut(300).then(() => this.setState({shouldRender: false}))
    else this.setState({shouldRender: false})
  }

  componentWillReceiveProps (nextProps) {
    // If active prop changed
    if (nextProps.active !== this.props.active) {
      if (nextProps.active) {
        this.startTimerToShow()
      } else {
        this.stopTimerAndHide()
      }
    }
  }

  renderIndicator () {
    // If a empty-message was specified, display the message
    if (this.props.emptyChatMessage && this.props.emptyChatMessage !== '') {
      return (
        <View style={styles.container}>
          <Animatable.View useNativeDriver delay={600} animation='flipInX' duration={350} style={styles.textWrapper}>
            <Text style={styles.text}>{this.props.emptyChatMessage}</Text>
          </Animatable.View>
        </View>
      )
    // else return an activity indicator
    } else {
      return (
        <LoadingOverlay type='Bounce' color={Colors.messageBubbles.activityIndicator} size={60} backgroundOpacity={0} />
      )
    }
  }

  render () {
    if (this.state.shouldRender) {
      return (
        <Animatable.View animation='fadeIn' duration={2000} useNativeDriver ref='view' style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}>
          {this.renderIndicator()}
        </Animatable.View>
      )
    } else return null
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 5,
    marginBottom: 10
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.messageBubbles.system.background,
    borderRadius: 15,
    minHeight: 30,
    maxWidth: 280,
    padding: 10
  },
  text: {
    backgroundColor: 'transparent',
    color: Colors.messageBubbles.system.text,
    fontSize: 16,
    textAlign: 'center'
  }
})
