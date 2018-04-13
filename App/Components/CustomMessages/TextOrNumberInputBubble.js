import React, { Component } from 'react'
import { StyleSheet, View, TextInput, Text } from 'react-native'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'

import {Colors, Fonts} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'

export default class TextOrNumberInputBubble extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onSubmit: PropTypes.func,
    setAnimationShown: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.submitted = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
    this.onlyNumbers = this.props.currentMessage.custom.onlyNumbers
  }

  state = {
    text: '',
    inputWidth: null,
    inputHeight: null
  }

  onSubmitHandler () {
    // Only handle submit the first time (to prevent unwanted "double-taps")
    if (!this.submitted) {
      const {currentMessage, onSubmit} = this.props
      const {onlyNumbers, textBefore, textAfter} = currentMessage.custom

      let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))

      let bubbleText = this.state.text

      // Empty text
      if (bubbleText === '') {
        if (onlyNumbers) {
          bubbleText = '0'
        } else {
          bubbleText = ' '
        }
      }

      // Placeholders
      if (textBefore != null) {
        bubbleText = textBefore + bubbleText
      }
      if (textAfter != null) {
        bubbleText = bubbleText + textAfter
      }

      // intention, text, value, relatedMessageId
      onSubmit(currentMessage.custom.intention, bubbleText, this.state.text, relatedMessageId)
    }
    this.submitted = true
  }

  onChange (text) {
    // Clean if only numbers are allowed
    if (this.onlyNumbers) {
      let newText = ''
      let numbers = '0123456789,.'
      let containsSeperator = false
      for (let i = 0; i < text.length; i++) {
        if (numbers.indexOf(text[i]) > -1) {
          // Check for multiple komma / dots
          if (['.', ','].includes(text[i])) {
            // only add if its the first seperator
            if (!containsSeperator) {
              newText = newText + text[i]
              containsSeperator = true
            }
          // If its a number, just add is
          } else newText = newText + text[i]
        }
      }
      this.setState({text: newText})
    } else {
      this.setState({text})
    }
  }

  onCancel () {
    const {currentMessage, onSubmit} = this.props
    let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
    // Convention: when canceled, just send an empty string
    // intention, text, value, relatedMessageId
    onSubmit(currentMessage.custom.intention, '', '', relatedMessageId)
  }

  // Measure width of hidden Text element to adjust input width
  updateWidth (width) {
    this.setState(
      {
        inputWidth: width
      }
    )
  }

  updateHeight (height) {
    this.setState({
      inputHeight: height
    })
  }

  renderWrapperText (text) {
    if (text != null && text !== '') return <Text style={styles.textInput}>{text}</Text>
    else return null
  }

  render () {
    const {currentMessage} = this.props
    let multiline = false
    if (currentMessage.custom.multiline) multiline = true
    let padding = 10
    // Add a little bit more padding for multiline,
    // otherwise the size of the input will always "jump" when typing because the resize isn't fast enough
    if (multiline) padding = 13
    let placeholder = ' '
    if (currentMessage.custom.placeholder != null) {
      // Add a space to placeholder to center placeholder in TextInput
      // (placeholder is formatted with 'textAlign: left' so the cursor isn't shown in the center, this causes an uneven 'padding' on the left)
      placeholder = currentMessage.custom.placeholder
    }
    let paddingLeft = 0
    let textAlign = 'center'
    if (multiline) textAlign = 'left'
    // If the placeholder is shown, set text-align to right so the curser isn't positioned over placeholder
    if (placeholder !== ' ' && this.state.text === '') {
      textAlign = 'left'
      paddingLeft = padding
    }
    return (
      <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={[inputMessageStyles.container]} onAnimationEnd={() => { this.shouldAnimate = false }} >
        <View style={styles.inputBubble}>
          {/* To adjust the width of the Input-Field dynamically by it's content,
          we need to create a hidden Text view with the same content and measure it using onLayout.
          This is quiet dirty, but until now, it seems to be the only working way.
          See: https://stackoverflow.com/a/33027556/4150548 */}
          <View style={{flexShrink: 1, paddingTop: 10, paddingBottom: 10, justifyContent: 'flex-start', alignItems: 'baseline', overflow: 'hidden', marginRight: 5}}>
            <View style={{height: 0, overflow: 'hidden'}}>
              <Text onLayout={(event) => this.updateWidth(event.nativeEvent.layout.width)} style={[styles.textInput, {paddingLeft: padding, paddingRight: padding, minWidth: 20, flex: 0, flexShrink: 1}]}>{(this.state.text !== '') ? this.state.text : currentMessage.custom.placeholder}</Text>
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {this.renderWrapperText(currentMessage.custom.textBefore)}
              <TextInput
                autoFocus
                onChangeText={(text) => this.onChange(text)}
                value={this.state.text}
                multiline={multiline}
                placeholder={placeholder}
                placeholderTextColor={Colors.optionDisabled}
                keyboardType={this.onlyNumbers ? 'numeric' : 'default'}
                underlineColorAndroid='rgba(0,0,0,0)'
                style={[styles.textInput, {paddingLeft, textAlign, flex: 0, flexShrink: 1, borderBottomWidth: 0.8, borderColor: Colors.optionDisabled, width: this.state.inputWidth, height: this.state.inputHeight}, multiline ? {borderBottomWidth: 0} : null]}
                autoCapitalize={'sentences'}
                returnKeyType={'done'}
                autoCorrect={false}
                selectionColor={Colors.leftBubbleBackground}
                onSubmitEditing={() => this.onSubmitHandler()}
                onContentSizeChange={(e) => this.updateHeight(e.nativeEvent.contentSize.height)}
              />
              {this.renderWrapperText(currentMessage.custom.textAfter)}
            </View>
          </View>
          {/* The mask view is just a little fix to keep the left padding of the input bubble visible,
            even when the TextInput overflows the container. */}
          <View style={styles.mask} />
          <Button
            containerStyle={styles.button}
            onPress={() => this.onCancel()}>
            <Icon name='ios-close-circle' type='ionicon' color={Colors.buttons.freeText.disabled} size={30} />
          </Button>
          <Button
            containerStyle={styles.button}
            onPress={() => this.onSubmitHandler()}>
            <Icon name='ios-checkmark-circle' type='ionicon' color={Colors.buttons.freeText.text} size={30} />
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
  mask: {
    backgroundColor: Colors.buttons.freeText.background,
    width: 15,
    height: 35,
    position: 'absolute',
    left: 0
  },
  button: {
    padding: 5,
    alignItems: 'center'
  },
  inputBubble: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 16,
    borderTopRightRadius: 3,
    backgroundColor: Colors.buttons.freeText.background,
    marginBottom: 4
  },
  textInput: {
    fontSize: 16,
    color: Colors.buttons.freeText.text,
    fontFamily: Fonts.type.family,
    overflow: 'hidden',
    fontWeight: 'normal',
    paddingBottom: 0,
    paddingTop: 0,
    textDecorationLine: 'none'
  }
})
