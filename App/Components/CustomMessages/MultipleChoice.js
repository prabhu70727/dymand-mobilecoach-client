import React, { Component } from 'react'
import { StyleSheet, Alert } from 'react-native'
import {Colors, Fonts} from '../../Themes/'
import Button from 'react-native-button'
import CustomMultiPicker from './CustomMultiPicker'
import I18n from '../../I18n/I18n'
import * as Animatable from 'react-native-animatable'

import {inputMessageStyles} from './Styles/CommonStyles'

import Log from '../../Utils/Log'
const log = new Log('Components/CustomMessages')

export default class MultipleChoice extends Component {
  constructor (props) {
    super(props)
    this.state = {
      res: [],
      selectedKeys: [],
      disabled: props.disabled || false
    }
    this.tapped = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
  }

  onPressHandler () {
    // Only handle click the first time (to prevent unwanted "double-taps")
    if (!this.tapped) {
      const { options } = this.props.currentMessage.custom
      const { currentMessage } = this.props
      if (this.checkAtLeastOneSelected()) {
        this.setState({disabled: true})
        // transform to correct exchange format
        const result = []
        let resultMessage = ''
        this.state.res.forEach((item, index) => {
          if (item !== '') {
            resultMessage = resultMessage + '- ' + options[index].label + '\n---\n'
            result.push(options[index].value)
          } else {
            result.push('')
          }
        })
        log.debug('returning multiples value', this.state.res)
        let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
        this.props.onPress(currentMessage.custom.intention, resultMessage, result.toString(), relatedMessageId)
        return
      }

      return Alert.alert(I18n.t('Common.chooseAtLeastOne'),
          '',
        [
            {text: 'OK', onPress: () => true}
        ]
      )
    }
    this.tapped = true
  }

  checkAtLeastOneSelected () {
    let oneSelected = false
    this.state.res.forEach((item) => {
      if (item !== '') {
        oneSelected = true
      }
    })
    return oneSelected
  }

  render () {
    const multipleSelect = true
    const { options } = this.props.currentMessage.custom
    const selectedItems = [] // ['C', 'E']
    // const message = currentMessage.text // 'Bitte auswählen. Könnte auch ein längerer Text sein!'
    const confirmText = I18n.t('Common.confirm')

    return (
      <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={[inputMessageStyles.container, {alignItems: 'stretch'}]} onAnimationEnd={() => { this.shouldAnimate = false }} >
        {/* <Text style={{marginBottom: 10}}>{message}</Text> */}
        <CustomMultiPicker
          options={options}
          disabled={this.state.disabled}
          multiple={multipleSelect}
          returnValue={'value'} // label or value or index
          callback={(res, selectedKeys) => { this.setState({res, selectedKeys}) }} // callback, array of selected items
          rowBackgroundColor={'white'}
          // rowHeight={40}
          rowRadius={5}
          iconColor={Colors.buttons.selectMany.items.text}
          iconSize={30}
          labelColor={Colors.buttons.selectMany.items.text}
          selectedIconName={'ios-checkmark-circle-outline'}
          unselectedIconName={'ios-radio-button-off-outline'}
          borderColor={Colors.buttons.selectMany.items.border}
          // scrollViewHeight={130}
          selected={selectedItems} // list of options which are selected by default
          // scrollViewStyle={} // Style object for scrollView that holds all items
          // itemStyle={} // Style object for the touchableOpacity of each item
          // selectedIconStyle={} // style object for the icon when selected
          // unselectedIconStyle={} // style object for the icon when unselected
        />
        <Button value={5} // {value}
          containerStyle={styles.buttonContainer}
          disabledContainerStyle={[styles.disabled]}
          style={styles.button}
          disabled={this.state.disabled}
          onPress={() => { this.onPressHandler() }}
          >
          {confirmText}
        </Button>
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
  buttonContainer: {
    marginTop: 10,
    marginHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    minHeight: 35,
    borderRadius: 16,
    backgroundColor: Colors.buttons.selectMany.submitButton.background,
    marginBottom: 4
  },
  button: {
    fontSize: Fonts.size.regular,
    color: Colors.buttons.selectMany.submitButton.text
  },
  disabled: {
    backgroundColor: Colors.buttons.selectMany.disabled
  }
})
