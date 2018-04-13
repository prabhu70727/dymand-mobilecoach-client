import React, {Component} from 'react'
import {View, StyleSheet, Alert, TouchableOpacity, Platform} from 'react-native'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import DatePicker from 'react-native-datepicker'
import I18n from '../../I18n/I18n'
import moment from 'moment'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'
import { Dropdown } from 'react-native-material-dropdown'

import BlurView from '../../Components/BlurView'
import {Colors} from '../../Themes/'
import {MealPlaces, EatOutOptions} from './FoodMetrics'
import {getNonEditableDays} from '../../Redux/Selectors'

import Log from '../../Utils/Log'
const log = new Log('AddMealModule/AddMealPreStep')

class AddMealPreStep extends Component {
  static propTypes = {
    onConfirm: PropTypes.func,
    onDiscard: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      selectedMealPlaceOption: 0,
      selectedMealTimeOption: 0,
      mealTime: new Date()
    }
    this.MealPlaceProps = [
      { label: I18n.t('FoodDiary.HOME'), value: 0 },
      { label: I18n.t('FoodDiary.EAT_OUT'), value: 1 }
    ]
    this.mealPlaceOptions = []
    for (var key in EatOutOptions) {
      if (EatOutOptions.hasOwnProperty(key)) {
        this.mealPlaceOptions.push({value: EatOutOptions[key], label: I18n.t('FoodDiary.' + EatOutOptions[key])})
      }
    }
    this.MealTimeProps = [
      { label: I18n.t('FoodDiary.justEaten'), value: 0 },
      { label: I18n.t('FoodDiary.chooseTime'), value: 1 }
    ]
    this.eatOutOption = this.mealPlaceOptions[0].value
  }

  onPressRadioButton (statePropertyName, value) {
    let newPropertyValue = {}
    newPropertyValue[statePropertyName] = value
    this.setState(newPropertyValue)
  }

  renderMealPlaceDropdown () {
    if (this.state.selectedMealPlaceOption === 1) {
      return (
        <Animatable.View
          useNativeDriver
          duration={350}
          animation='flipInX'
          style={{
            flexDirection: 'row',
            flex: 1
          }}
        >
          <Dropdown
            label={I18n.t('FoodDiary.mealplace')}
            data={this.mealPlaceOptions}
            value={this.mealPlaceOptions[0].value}
            fontSize={14}
            containerStyle={{
              backgroundColor: Colors.buttons.common.background,
              flex: 1,
              borderRadius: 5,
              marginTop: 10,
              marginBottom: 10,
              padding: 10,
              paddingTop: 0,
              paddingBottom: 5,
              borderColor: Colors.buttons.common.background
            }}
            inputContainerStyle={{
              borderBottomWidth: 1,
              paddingBottom: 0
            }}
            textColor={Colors.buttons.common.text}
            baseColor={Colors.buttons.common.text}
            selectedItemColor={Colors.buttons.common.background}
            itemTextStyle={{color: Colors.buttons.common.background}}
            onChangeText={(value, index, data) => this.onChangeDropdown(value, index, data)}
          />
        </Animatable.View>
      )
    }
  }

  onChangeDropdown (value, index, data) {
    this.eatOutOption = value
  }

  renderTimePicker () {
    if (this.state.selectedMealTimeOption === 1) {
      let maxDate = moment(new Date())
      maxDate.hour(23)
      maxDate.minute(59)
      maxDate.second(59)
      maxDate.millisecond(0)
      let minDate = moment(maxDate)
      // For some reason we only need to subtract 1 day for android date-picker
      if (Platform.OS === 'ios') minDate = minDate.subtract(2, 'days').add(1, 'seconds')
      // TODO: Check if this is working properly on different android devices!
      else minDate = minDate.subtract(1, 'days')
      log.debug('Current locale for date picker:', moment.locale())

      return (
        <View style={{flexDirection: 'row'}}>
          <Animatable.View
            useNativeDriver
            duration={350}
            animation='flipInX'
            style={{
              flexDirection: 'row',
              flex: 1}}
          >
            <DatePicker
              style={{
                backgroundColor: Colors.buttons.common.background,
                flex: 1,
                borderRadius: 5,
                marginTop: 10,
                padding: 10,
                paddingTop: 5,
                paddingBottom: 5,
                borderColor: Colors.buttons.common.background}}
              date={this.state.mealTime}
              mode='datetime'
              is24Hour
              locale={moment.locale()}
              format='DD.MM.YYYY HH:mm'
              placeholder={I18n.t('Common.chooseDate')}
              confirmBtnText={I18n.t('Common.confirm')}
              cancelBtnText={I18n.t('Common.abort')}
              maxDate={maxDate.toDate()}
              minDate={minDate.toDate()}
              iconComponent={<Icon name='calendar' containerStyle={{
                position: 'absolute',
                left: -2,
                top: 4,
                marginLeft: 0
              }} type='entypo' size={32} color={Colors.buttons.common.text} />}
              customStyles={{
                dateInput: {
                  marginLeft: 36,
                  height: 30,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: '#C3CDD4'
                },
                dateText: {
                  fontSize: 14,
                  color: Colors.buttons.common.text
                },
                placeholderText: {
                  fontSize: 14,
                  color: Colors.buttons.common.text
                }
              // ... You can check the source to find the other keys.
              }}
              onDateChange={(date) => this.onDateChange(date)}
              TouchableComponent={TouchableOpacity}
             />
          </Animatable.View>
        </View>
      )
    }
    return null
  }

  onDateChange (date) {
    let newDate = moment(date, 'DD.MM.YYYY HH:mm').toDate()
    log.info('Selected new Meal-Date: ' + newDate)
    this.setState({
      mealTime: newDate
    })
  }

  renderButtons (buttonProps, statePropertyName) {
    return (
      buttonProps.map((obj, i) => (
        <RadioButton labelHorizontal key={i} style={[styles.radioButtonStyle, i === 0 ? styles.radioButtonLeft : styles.radioButtonRight]} >
          <RadioButtonInput
            obj={obj}
            index={i}
            isSelected={this.state[statePropertyName] === i}
            onPress={() => { this.onPressRadioButton(statePropertyName, i) }}
            buttonInnerColor={Colors.buttons.common.background}
            buttonOuterColor={Colors.buttons.common.background}
            buttonWrapStyle={{marginLeft: 10}}
          />
          <RadioButtonLabel
            obj={obj}
            index={i}
            labelHorizontal
            onPress={() => {}}
            labelStyle={styles.labelStyle}
          />
        </RadioButton>
      ))
    )
  }

  render () {
    return (
      <BlurView ref='blurview'>
        <View style={styles.container}>
          <Animatable.View
            ref='cardSection'
            style={styles.cardSection}
            useNativeDriver
          >
            <View style={styles.inputContainer}>
              <RadioForm
                formHorizontal
                animation
              >
                {this.renderButtons(this.MealPlaceProps, 'selectedMealPlaceOption')}
              </RadioForm>
              <View style={{flexDirection: 'row'}}>
                {this.renderMealPlaceDropdown()}
              </View>
              <RadioForm
                formHorizontal
                animation
              >
                {this.renderButtons(this.MealTimeProps, 'selectedMealTimeOption')}
              </RadioForm>
              {this.renderTimePicker()}
            </View>
            <View style={{flexDirection: 'row'}}>
              <Button
                containerStyle={styles.buttonContainer}
                style={styles.button}
                onPress={() => this.onConfirm()}>
                Weiter
              </Button>
            </View>
          </Animatable.View>
        </View>
      </BlurView>
    )
  }

  onConfirm () {
    let mealPlace = MealPlaces.HOME
    let mealTime = new Date()
    // Convert mealtime to date-object
    let m = moment(this.state.mealTime)
    // If day has been finally marked as complete / incomplete, dont allow to add a new meal..
    if (this.props.nonEditableDays.includes(m.format('DD.MM.YYYY'))) {
      Alert.alert(
        I18n.t('FoodDiary.finallyMarkedCompleteNotice'),
        '',
        [
            {text: I18n.t('FoodDiary.chooseOtherDate'), onPress: () => true},
            {text: I18n.t('FoodDiary.backToChat'), onPress: () => this.props.onDiscard()}
        ]
      )
    } else {
      if (this.state.selectedMealPlaceOption === 1) mealPlace = this.eatOutOption
      if (this.state.selectedMealTimeOption === 1) mealTime = this.state.mealTime
      log.info('Creating new Meal: ' + mealPlace + ', ' + mealTime)
      // simultaniously fadeout blurview & cardview
      this.refs.blurview.animatable().fadeOut(350)
      this.refs.cardSection.flipOutY(350).then(() => this.props.onConfirm(mealPlace, mealTime))
    }
  }
}

const mapStateToProps = (state) => {
  return {
    nonEditableDays: getNonEditableDays(state)
  }
}

export default connect(mapStateToProps)(AddMealPreStep)

// TODO: Export to themesfile
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    height: 50,
    backgroundColor: Colors.buttons.common.background,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    color: Colors.buttons.common.text
  },
  radioButtonStyle: {
    borderBottomWidth: 1,
    borderColor: '#C3CDD4',
    padding: 5
  },
  radioButtonLeft: {
    marginRight: 10,
    paddingRight: 0
  },
  radioButtonRight: {
    paddingLeft: 0
  },
  labelStyle: {
    width: 90,
    fontSize: 14,
    backgroundColor: 'transparent',
    color: Colors.main.paragraph
  },
  cardSection: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'column',
    backgroundColor: Colors.main.appBackground,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300
  },
  inputContainer: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
