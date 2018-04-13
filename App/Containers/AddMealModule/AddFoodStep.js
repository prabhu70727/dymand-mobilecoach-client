import React, {Component} from 'react'
import { Text, View, TouchableWithoutFeedback, Keyboard, StyleSheet, TextInput, Picker, Platform, Alert } from 'react-native'
import PropTypes from 'prop-types'
import Button from 'react-native-button'
import R from 'ramda'
import { Icon } from 'react-native-elements'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import * as Animatable from 'react-native-animatable'
import I18n from '../../I18n/I18n'
import { Dropdown } from 'react-native-material-dropdown'

import BlurView from '../../Components/BlurView'
import Colors from '../../Themes/Colors'
import {getBaseUnit} from './FoodMetrics'
import Log from '../../Utils/Log'
const log = new Log('AddMealModule/AddFoodStep')

export default class AddMealView extends Component {
  static propTypes = {
    food: PropTypes.object,
    onCancel: PropTypes.func,
    addFood: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      value: '1',
      selectedUnit: 0,
      inputValid: true
    }
  }

  renderPicker () {
    const {units} = this.props.food
    if (Platform.OS === 'ios') {
      return (
        <Picker
          style={styles.pickerStyle}
          itemStyle={{height: 120}}
          selectedValue={this.state.selectedUnit}
          onValueChange={(itemValue, itemIndex) => {
            this.setState({
              selectedUnit: itemIndex
            })
          }}>
          {
            units.map((unit, i) => {
              let label = I18n.t('FoodUnits.' + unit.unitId)
              // Add Gramm Values to label for portion-Size Units
              if ([13, 23, 65].includes(unit.unitId)) label = label + ' (' + unit.conversionToGram + getBaseUnit(this.props.food) + ')'
              // If its a portion value which already contains paranthesis, replace the closing paranthesis and add the gram value
              if ([31, 40, 42, 69, 91, 92, 93].includes(unit.unitId)) label = label.replace(')', ', ' + unit.conversionToGram + getBaseUnit(this.props.food) + ')')
              return <Picker.Item key={i} label={label} value={i} />
            })
          }
        </Picker>)
    } else {
      let data = []
      units.forEach((unit, index) => {
        let label = I18n.t('FoodUnits.' + unit.unitId)
        // Add Gramm Values to label for portion-Size Units
        if ([13, 23, 65].includes(unit.unitId)) label = label + ' (' + unit.conversionToGram + getBaseUnit(this.props.food) + ')'
        // If its a portion value which already contains paranthesis, replace the closing paranthesis and add the gram value
        if ([31, 40, 42, 69, 91, 92, 93].includes(unit.unitId)) label = label.replace(')', ', ' + unit.conversionToGram + getBaseUnit(this.props.food) + ')')
        data.push({value: index, label})
      })
      return (
        <View style={{
          flexDirection: 'row'
        }}>
          <Dropdown
            label=''
            data={data}
            value={0}
            fontSize={18}
            containerStyle={{
              flex: 1,
              margin: 30,
              marginTop: 0
            }}
            baseColor={Colors.main.grey1}
            onChangeText={(value, index, data) => this.setState({selectedUnit: index})}
          />
        </View>
      )
    }
  }

  render () {
    return (
      <BlurView ref='blurview'>
        <View style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {this.renderInputContainer()}
          </TouchableWithoutFeedback>
          {Platform.OS === 'ios' ? <KeyboardSpacer /> : null}
        </View>
      </BlurView>
    )
  }

  renderInputContainer () {
    return (
      <Animatable.View ref='view' useNativeDriver>
        <View style={[styles.cardSection, Platform.OS === 'ios' ? {marginBottom: 80} : null]}>
          <Text numberOfLines={2} style={styles.headline}>{this.props.food.foodnameDE.toUpperCase()}</Text>
          <TextInput
            keyboardType='numeric'
            style={styles.textInput}
            onChangeText={(text) => this.onChange(text)}
            value={this.state.value}
            onFocus={() => this.onFocusInput()}
            onBlur={() => this.onBlurInput()}
            onSubmitEditing={() => this.androidSubmitHandler()}
          />
          {this.renderPicker()}
          <View style={styles.buttonRow}>
            <Button
              activeOpacity={0.5}
              containerStyle={styles.cancelButtonContainer}
              style={styles.cancelButton}
              onPress={() => {
                this.props.onCancel()
              }}>
              <Icon size={60} type='ionicon' name='ios-close' color={'#fff'} iconStyle={styles.icon} />
            </Button>
            <Button
              activeOpacity={0.5}
              containerStyle={styles.addButtonContainer}
              style={styles.addButton}
              disabledContainerStyle={styles.addButtonDisabled}
              // regex to test if string only contains zeroes
              disabled={!this.checkInputValidity()}
              onPress={() => this.onPressHanlder()} >
              <Icon size={60} type='ionicon' name='ios-checkmark' color={'#fff'} iconStyle={styles.icon} />
            </Button>
          </View>
        </View>
      </Animatable.View>
    )
  }

  androidSubmitHandler () {
    if (this.checkInputValidity()) {
      this.onPressHanlder()
    } else {
      return Alert.alert(
        I18n.t('Common.validationError'),
          '',
        [
            {text: I18n.t('Common.ok'), onPress: () => true}
        ]
      )
    }
  }

  onFocusInput () {
    // only delete text the first time the user taps inside input field..
    if (this.state.value === '1') {
      this.setState({
        value: ''
      })
    }
  }

  onBlurInput () {
    // only delete text the first time the user taps inside input field..
    if (this.state.value === '') {
      this.setState({
        value: '1'
      })
    }
  }

  checkInputValidity () {
    if (typeof this.state.value === 'undefined') return false
    if (this.state.value === null || /^0*$/.test(this.state.value) || [',', '.'].includes(this.state.value.slice(-1))) return false
    return true
  }

  onPressHanlder () {
    const { units } = this.props.food
    let unit = units[this.state.selectedUnit]
    let value = parseFloat(this.state.value.replace(',', '.'))
    let newFood = R.clone(this.props.food)
    newFood.selectedAmount = {value, unit: {unitNameDE: unit.unitNameDE, unitId: unit.unitId}}
    newFood.calculatedGram = unit.conversionToGram * value
    log.info('Adding new food to meal: "' + newFood.foodnameDE + '" ' +
      'Selected Amount: ' + value + ' ' + unit.unitNameDE +
      ', Calculated Gram: ' + newFood.calculatedGram
    )
    // simultaniously fadeout blurview & cardview
    this.refs.blurview.animatable().fadeOut(350)
    this.refs.view.flipOutY(350).then(() => this.props.addFood(newFood))
  }

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
    this.setState({value: newText})
  }
}

const styles = StyleSheet.create({
  icon: {
    color: Colors.buttons.common.text,
    height: 60
  },
  buttonRow: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.main.grey1
  },
  cancelButtonContainer: {
    flex: 1,
    backgroundColor: Colors.main.grey1,
    justifyContent: 'center'
  },
  addButtonContainer: {
    flex: 1,
    backgroundColor: Colors.buttons.common.background,
    justifyContent: 'center'
  },
  addButtonDisabled: {
    backgroundColor: Colors.buttons.common.disabled
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 280
  },
  headline: {
    margin: 20,
    color: Colors.main.grey1,
    fontSize: 20,
    textAlign: 'center'
  },
  textInput: {
    fontSize: 30,
    color: Colors.main.grey1,
    width: 100,
    ...Platform.select({
      ios: {
        height: 40
      }
    }),
    borderColor: Colors.main.grey1,
    borderBottomWidth: (Platform.OS === 'ios') ? 1 : 0,
    textAlign: 'center'
  },
  pickerStyle: {
    height: 80,
    ...Platform.select({
      ios: {
        height: 118,
        width: 280
      },
      android: {
        minWidth: 200
      }
    })
  }
})
