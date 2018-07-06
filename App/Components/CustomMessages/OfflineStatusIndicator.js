import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'
import { Colors } from '../../Themes/'
import I18n from '../../I18n/I18n'
import * as Animatable from 'react-native-animatable'

export default class OfflineStatusIndicator extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired
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

  // Always wait 5s before showing indicator to prevent indicator from flashing
  startTimerToShow () {
    // check for timeoutID to ensure only one timer is running
    if (!this.timeoutID) {
      this.timeoutID = setTimeout(() => {
        this.timeoutID = null
        this.setState({ shouldRender: true })
      }, 5000)
    }
  }

  stopTimerAndHide () {
    clearTimeout(this.timeoutID)
    this.timeoutID = null
    // Fade out Animation
    if (this.refs.view) this.refs.view.flipOutX(350).then(() => this.setState({shouldRender: false}))
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

  render () {
    if (this.state.shouldRender) {
      return (
        <View style={[styles.container, this.props.containerStyle]}>
          <Animatable.View ref='view' useNativeDriver style={[styles.wrapper, this.props.wrapperStyle]} duration={350} animation='flipInX'>
            <Text style={[styles.text, this.props.textStyle]}>
              {I18n.t('ConnectionStates.offlineNotice')}
            </Text>
          </Animatable.View>
        </View>
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
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.connectionIndicator.intermediateState,
    borderRadius: 15,
    height: 30,
    paddingLeft: 10,
    paddingRight: 10
  },
  text: {
    backgroundColor: 'transparent',
    color: Colors.messageBubbles.system.text,
    fontSize: 12,
    fontWeight: '300'
  }
})
