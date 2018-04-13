import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Slider from 'react-native-slider'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'

import {Colors} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'

export default class LikertSlider extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onSubmit: PropTypes.func,
    setAnimationShown: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.submitted = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
    const {min, max} = this.props.currentMessage.custom
    // Initial value = middle
    this.initialValue = Math.floor((min.value + max.value) / 2)
    this.state = {
      value: this.initialValue
    }
  }

  onSubmitHandler () {
    // Only handle submit the first time (to prevent unwanted "double-taps")
    if (!this.submitted) {
      const {currentMessage, onSubmit} = this.props
      let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
      // intention, text, value, relatedMessageId
      onSubmit(currentMessage.custom.intention, this.state.value.toString(), this.state.value, relatedMessageId)
    }
    this.submitted = true
  }

  onCancel () {
    const {currentMessage, onSubmit} = this.props
    let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
    // Convention: when canceled, just send an empty string
    // intention, text, value, relatedMessageId
    onSubmit(currentMessage.custom.intention, '', '', relatedMessageId)
  }

  render () {
    const {currentMessage} = this.props
    return (
      <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={[inputMessageStyles.container]} onAnimationEnd={() => { this.shouldAnimate = false }} >
        <View style={styles.inputBubble}>
          <View style={{flex: 1, flexDirection: 'column', marginRight: 5}}>
            <Slider
              step={1}
              style={styles.slider}
              value={this.initialValue}
              animateTransitions
              maximumValue={currentMessage.custom.max.value}
              minimumValue={currentMessage.custom.min.value}
              minimumTrackTintColor={Colors.buttons.likertSlider.minTint}
              maximumTrackTintColor={Colors.buttons.likertSlider.maxTint}
              thumbTintColor={Colors.buttons.likertSlider.thumb}
              onSlidingComplete={(value) => this.setState({value})}
            />
            <View style={{flexDirection: 'row', paddingBottom: 5}}>
              <View style={{flex: 1, alignItems: 'flex-start', alignSelf: 'flex-start'}}>
                <Text style={styles.label}>{currentMessage.custom.min.label}</Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end', alignSelf: 'flex-start'}}>
                <Text style={[styles.label, {textAlign: 'right'}]}>{currentMessage.custom.max.label}</Text>
              </View>
            </View>
          </View>
          <Button
            containerStyle={styles.button}
            onPress={() => this.onCancel()}>
            <Icon name='ios-close-circle' type='ionicon' color={Colors.buttons.common.disabled} size={30} />
          </Button>
          <Button
            containerStyle={styles.button}
            onPress={() => this.onSubmitHandler()}>
            <Icon name='ios-checkmark-circle' type='ionicon' color={Colors.buttons.common.text} size={30} />
          </Button>
        </View>
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
}
const styles = StyleSheet.create({
  label: {
    color: Colors.buttons.common.text
  },
  button: {
    padding: 5
  },
  inputBubble: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    minHeight: 35,
    borderRadius: 16,
    borderTopRightRadius: 3,
    backgroundColor: Colors.buttons.common.background,
    marginBottom: 4
  },
  slider: {
    flex: 1
  }
})
