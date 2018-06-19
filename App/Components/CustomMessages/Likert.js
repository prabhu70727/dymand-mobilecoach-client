import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import {Colors, Metrics} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'
import * as Animatable from 'react-native-animatable'

export default class Likert extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onPress: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.tapped = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
  }

  renderItem (option, itemSize, onPress, index, length) {
    let alternativeLayout = false
    // Special layout for large likerts
    const minWidth = 35
    let circleSize = itemSize - 5
    if (itemSize < minWidth) {
      alternativeLayout = true
      circleSize = 28
      itemSize = 32
    }
    const itemStyle = {
      width: circleSize, height: circleSize, backgroundColor: Colors.buttons.common.background, borderRadius: circleSize / 2, justifyContent: 'center', alignItems: 'center'
    }

    return (
      <Animatable.View
        useNativeDriver
        key={index}
        animation={this.shouldAnimate ? this.props.fadeInAnimation : null}
        delay={index * this.props.delayOffset}
        duration={this.props.duration}
        onAnimationEnd={() => { this.shouldAnimate = false }}
      >
        <TouchableOpacity
          onPress={() => this.onPressHandler(this.props.currentMessage, option.label, option.value)}
          style={{
            width: itemSize,
            alignItems: 'center'
          }}
        >
          <View style={itemStyle}>
            {this.renderValue(option, itemStyle)}
          </View>
          {this.renderLabel(option, itemSize, index, length, alternativeLayout)}
        </TouchableOpacity>
      </Animatable.View>
    )
  }

  componentDidMount () {
    // notify redux that animationw as shown after first render
    const {currentMessage} = this.props
    if (currentMessage.custom.shouldAnimate) {
      this.props.setAnimationShown(currentMessage._id)
    }
  }

  onPressHandler (message, text, value) {
    // Only handle click the first time (to prevent unwanted "double-taps")
    if (!this.tapped) {
      let relatedMessageId = message._id.substring(0, message._id.lastIndexOf('-'))
      this.props.onPress(message.custom.intention, text, value, relatedMessageId)
    }
    this.tapped = true
  }

  shouldRenderLabel (index, length, alternativeLayout) {
    if (!alternativeLayout) return true
    else {
      // even length
      if (length % 2 === 0) {
        // First / Last
        if (index === 0 || index === length - 1) return true
        // both middle-elements
        if (index === (length / 2) + 1 || index === (length / 2) - 1) return false
        // left side
        if (index < (length / 2)) return (index % 2 === 0)
        // right side
        if (index > (length / 2)) return (index % 2 === 1)
      // odd length
      } else {
        if (index % 2 === 0) return true
      }
      return false
    }
  }

  renderValue (option) {
    if (!this.props.currentMessage.custom.options.silent) {
      return (
        <Text style={{color: Colors.buttons.common.text}}>{option.value}</Text>
      )
    }
  }

  renderLabel (option, itemSize, index, length, alternativeLayout) {
    if (this.shouldRenderLabel(index, length, alternativeLayout)) {
      return (
        <View style={{
          alignItems: 'center',
          width: alternativeLayout ? itemSize * 2 : itemSize,
          marginTop: 10
        }}>
          <Text style={{
            color: Colors.buttons.common.background,
            fontSize: 10
          }}>
            {option.label}
          </Text>
        </View>
      )
    }
  }

  render () {
    const {currentMessage, onPress} = this.props
    const {answers} = currentMessage.custom.options
    const maxWidth = 50
    let itemSize = (Metrics.screenWidth - 40) / answers.length
    if (itemSize > maxWidth) itemSize = maxWidth
    // const isLast = currentMessage.isLast

    return (
      <View style={[inputMessageStyles.container, {flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start'}]}>
        {answers.map((option, index, array) => {
          return this.renderItem(option, itemSize, onPress, index, array.length)
        })}
      </View>
    )
  }
}
