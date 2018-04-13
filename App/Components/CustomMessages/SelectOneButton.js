import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'

import {Colors} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'

class Option extends Component {
  static propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
    value: PropTypes.string,
    optionKey: PropTypes.number.isRequired,
    setMessageProperties: PropTypes.func,
    fadeInAnimation: PropTypes.string,
    delay: PropTypes.number,
    duration: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.shouldAnimate = true
  }

  render () {
    const { title, value } = this.props
    // disabledContainerStyle={[styles.disabled, (currentMessage.custom.selected === value) && styles.selected]}
    return (
      <Animatable.View ref='view' useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} delay={this.props.delay} duration={this.props.duration} onAnimationEnd={() => { this.shouldAnimate = false }}>
        <Button value={value}
          containerStyle={styles.buttonContainer}
          style={styles.button}
          title={title}
          onPress={() => this.props.onPress(this.props.optionKey)}>
          {title}
        </Button>
      </Animatable.View>
    )
  }

  animatable = () => {
    return this.refs.view
  }
}

export default class SelectOneButton extends Component {
  constructor (props) {
    super(props)
    this.tapped = false
    this.animatableRefs = {}
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
  }
  static propTypes = {
    currentMessage: PropTypes.object,
    onPress: PropTypes.func,
    fadeInAnimation: PropTypes.string,
    fadeOutAnimation: PropTypes.string,
    fadeOutSelectedAnimation: PropTypes.string,
    delayOffset: PropTypes.number,
    duration: PropTypes.number
  }

  onPressHandler (message, text, value, selectedOptionKey) {
    // Only handle click the first time (to prevent unwanted "double-taps")
    if (!this.tapped) {
      let relatedMessageId = message._id.substring(0, message._id.lastIndexOf('-'))
      this.props.onPress(message.custom.intention, text, value, relatedMessageId)
      this.tapped = true

      // Apparently, the "Animation-Finished" callback is called quite delayed,
      // which causes a disruptive break between fadeOut-Animation of input-Option and fadeIn-Animation of answer message
      // so for now, don't use the fade-Out animation

      /*
      if (this.props.fadeOutAnimation) {
        let animationPromises = []
        for (let key in this.animatableRefs) {
          if (this.animatableRefs.hasOwnProperty(key)) {
            let ref = this.animatableRefs[key]
            if (key !== selectedOptionKey.toString()) animationPromises.push(ref.animatable()[this.props.fadeOutAnimation](100))
          }
        }
        Promise.all(animationPromises).then(() => {
          let relatedMessageId = message._id.substring(0, message._id.lastIndexOf('-'))
          this.props.onPress(message.custom.intention, text, value, relatedMessageId)
          // set tapped flag to prevent multiple submits
          this.tapped = true
        }, (err) => {
          log.warn('An error accured while animating Input-Message:', err)
        })
      // if there is no fadeOut-Animation, sent answer immediately
      } else {
        let relatedMessageId = message._id.substring(0, message._id.lastIndexOf('-'))
        this.props.onPress(message.custom.intention, text, value, relatedMessageId)
        // set tapped flag to prevent multiple submits
        this.tapped = true
      }
      */
    }
  }

  async callFunctionAfterDelay (func, delay) {
    setTimeout(() => {
      func()
    }, delay)
  }

  componentDidMount () {
    // notify redux that animationw as shown after first render
    const {currentMessage} = this.props
    if (currentMessage.custom.shouldAnimate) {
      this.props.setAnimationShown(currentMessage._id)
    }
  }

  render () {
    const {options} = this.props.currentMessage.custom

    return (
      <View style={inputMessageStyles.container}>
        {options.map((item, index) => {
          return (
            <Option
              key={index}
              optionKey={index}
              title={item.button}
              value={item.value}
              currentMessage={this.props.currentMessage}
              onPress={(optionKey) => this.onPressHandler(this.props.currentMessage, item.button, item.value, optionKey)}
              ref={(ref) => {
                // Apparently, this callback is often called with "null"-values..
                if (ref !== null) this.animatableRefs[index] = ref
              }}
              fadeInAnimation={this.shouldAnimate ? this.props.fadeInAnimation : null}
              fadeOutSelectedAnimation={this.props.fadeOutSelectedAnimation}
              delay={index * this.props.delayOffset}
              duration={this.props.duration}
            />
          )
        })}
      </View>
    )
  }
}
const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    padding: 5,
    minHeight: 35,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: Colors.buttons.selectOne.background,
    marginBottom: 2
  },
  button: {
    fontSize: 16,
    color: Colors.buttons.selectOne.text,
    fontWeight: 'normal'
  }
})
