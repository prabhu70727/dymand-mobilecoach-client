import React, { Component } from 'react'
import { StyleSheet, View, TextInput, Text, Alert } from 'react-native'
import * as Animatable from 'react-native-animatable'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import { Icon } from 'react-native-elements'

import {Colors, Fonts} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'

export default class NumberInputBubble extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onSubmit: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.submitted = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
  }

  state = {
    text: '',
    inputWidth: 40
  }

  onSubmitHandler () {
    // Only handle submit the first time (to prevent unwanted "double-taps")
    if (!this.submitted) {
      const {currentMessage, onSubmit} = this.props
      const {textBefore, textAfter} = currentMessage.custom
      let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
      // when text is empty, send a blank space so a empty bubble will be shown..
      if (this.state.text === '') {
        // TODO: internationalisation
        Alert.alert('Bitte trage eine Zahl ein.',
            '',
          [
              {text: 'OK', onPress: () => true}
          ]
        )
      // intention, text, value, relatedMessageId
      } else {
        onSubmit(currentMessage.custom.intention, textBefore + this.state.text + textAfter, this.state.text, relatedMessageId)
        this.submitted = true
      }
    }
  }

  // Replace unwated chars
  onChange (text) {
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
  }

  onCancel () {
    const {currentMessage, onSubmit} = this.props
    let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
    // Convention: when canceled, just send an empty string
    // intention, text, value, relatedMessageId
    onSubmit(currentMessage.custom.intention, '', '', relatedMessageId)
  }

  // Measure width of hidden Text element to adjust input width
  measureView (event) {
    // additional 5 'pixels' for cursor
    this.setState(
      {
        inputWidth: event.nativeEvent.layout.width + 7
      }
    )
  }

  render () {
    const {currentMessage} = this.props
    return (
      <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={inputMessageStyles.container} onAnimationEnd={() => { this.shouldAnimate = false }}>
        <View style={styles.inputBubble}>
          {/* To adjust the width of the Input-Field dynamically by it's content,
          we need to create a hidden Text view with the same content and measure it using onLayout.
          This is quiet dirty, but until now, it seems to be the only working way.
          See: https://stackoverflow.com/a/33027556/4150548 */}
          <View style={{height: 0, overflow: 'hidden'}}>
            <Text onLayout={(event) => this.measureView(event)} style={[styles.textInput, {position: 'absolute', color: 'transparent', top: -30}]}>{this.state.text ? this.state.text : currentMessage.custom.placeholder}</Text>
          </View>
          <View style={{flexShrink: 1, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden', marginRight: 5, flexWrap: 'wrap'}}>
            {this.renderWrapperText(currentMessage.custom.textBefore)}
            <TextInput
              autoFocus
              onChangeText={(text) => this.onChange(text)}
              value={this.state.text}
              multiline={false}
              underlineColorAndroid='transparent'
              style={[styles.textInput, {flex: 0, flexShrink: 1, minWidth: 30, borderBottomWidth: 1, borderColor: Colors.optionDisabled, width: this.state.inputWidth}]}
              autoCapitalize={'words'}
              returnKeyType={'search'}
              keyboardType='numeric'
              autoCorrect={false}
              selectionColor={Colors.buttons.freeNumbers.selection}
              placeholderTextColor={Colors.buttons.freeNumbers.placeholder}
              placeholder={currentMessage.custom.placeholder}
              onSubmitEditing={() => this.onSubmitHandler()}
            />
            {this.renderWrapperText(currentMessage.custom.textAfter)}
          </View>
          <Button
            containerStyle={styles.button}
            onPress={() => this.onCancel()}>
            <Icon name='ios-close-circle' type='ionicon' color={Colors.buttons.freeNumbers.text} size={30} />
          </Button>
          <Button
            containerStyle={styles.button}
            onPress={() => this.onSubmitHandler()}>
            <Icon name='ios-checkmark-circle' type='ionicon' color={Colors.buttons.freeNumbers.disabled} size={30} />
          </Button>
        </View>
      </Animatable.View>
    )
  }

  renderWrapperText (text) {
    if (text && text !== '' && text !== ' ') return <Text style={styles.textInput}>{text}</Text>
    else return null
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
    backgroundColor: Colors.buttons.freeNumbers.background,
    marginBottom: 4
  },
  textInput: {
    fontSize: 16,
    color: Colors.buttons.freeNumbers.text,
    fontFamily: Fonts.type.family,
    textAlign: 'center',
    overflow: 'hidden',
    fontWeight: 'normal',
    paddingBottom: 0,
    paddingTop: 0
  }
})
