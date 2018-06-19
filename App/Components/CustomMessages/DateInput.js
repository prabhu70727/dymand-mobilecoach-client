import React, { Component } from 'react'
import { StyleSheet, View, Alert, Text, Platform } from 'react-native'
import PropTypes from 'prop-types'
import Button from 'react-native-button'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'
import DatePicker from 'react-native-datepicker'
import I18n from '../../I18n/I18n'
import moment from 'moment'

import {Colors} from '../../Themes/'
import {inputMessageStyles} from './Styles/CommonStyles'

export default class DateInput extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onSubmit: PropTypes.func,
    setAnimationShown: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.submitted = false
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
    this.minDate = this.getMinMaxDate(false)
    this.maxDate = this.getMinMaxDate(true)
  }

  getMinMaxDate (maxDate) {
    const {currentMessage} = this.props
    const {min, max} = currentMessage.custom
    let dateTime = null
    if (maxDate) {
      dateTime = max
    } else {
      dateTime = min
    }
    if (dateTime == null) {
      return null
    }
    switch (currentMessage.custom.mode) {
      case 'time': {
        const hour = Math.floor(Number(dateTime))
        const minute = Math.round((Number(dateTime) - hour) * 60)
        const timeString = hour + ':' + minute
        return moment(timeString, 'HH:mm').toDate()
      }
      case 'date': {
        return moment(dateTime, 'DD.MM.YYYY').toDate()
      }
      case 'datetime':
      default: {
        const dateTimeArray = dateTime.split(',')
        const hour = Math.floor(Number(dateTimeArray[1]))
        const minute = Math.round((Number(dateTimeArray[1]) - hour) * 60)
        const timeString = hour + ':' + minute
        return moment(dateTimeArray[0] + ' ' + timeString, 'DD.MM.YYYY HH:mm').toDate()
      }
    }
  }

  state = {
    date: null,
    inputWidth: 150
  }

  onSubmitHandler () {
    // Only handle submit the first time (to prevent unwanted "double-taps")
    if (!this.submitted) {
      const {currentMessage, onSubmit} = this.props
      let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
      // when date is empty, send a blank space so a empty bubble will be shown..
      if (this.state.date === null) {
        return Alert.alert(I18n.t('Common.invalid'),
            I18n.t('Common.validationError'),
          [
              {text: I18n.t('Common.ok'), onPress: () => true}
          ]
        )
      } else {
        // Check if date is valid (on IOS, we can rely on the datePicker, while on android there is no
        // min/max values for the time-picker)
        if ((this.minDate != null && this.state.date < this.minDate) || (this.maxDate != null && this.state.date > this.maxDate)) {
          return Alert.alert(I18n.t('Common.invalid'),
              (`${I18n.t('Common.datePicker.outOfRange')} ${moment(this.minDate).format(this.formatDateForClient())} ${I18n.t('Common.and')}\n${moment(this.maxDate).format(this.formatDateForClient())}.`),
            [
              {text: I18n.t('Common.ok'), onPress: () => true}
            ]
          )
        } else onSubmit(currentMessage.custom.intention, moment(this.state.date).format(this.formatDateForClient()), this.formatDateForServer(this.state.date), relatedMessageId)
      }
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

  // fix formats for dates sent to server
  formatDateForServer (date) {
    const {currentMessage} = this.props
    switch (currentMessage.custom.mode) {
      case 'time': {
        const momentDate = moment(date)
        return momentDate.format('HH') + '.' + Math.floor(momentDate.format('mm') / 60 * 100)
      }
      case 'date': {
        return moment(date).format('DD.MM.YYYY')
      }
      case 'datetime':
      default: {
        const momentDate = moment(date)
        return moment(date).format('DD.MM.YYYY') + ',' + momentDate.format('HH') + '.' + Math.floor(momentDate.format('mm') / 60 * 100)
      }
    }
  }

  // Use different converter for client to be able to adjust to clients locale
  formatDateForClient () {
    const {currentMessage} = this.props
    switch (currentMessage.custom.mode) {
      case 'time': {
        return 'LT'
      }
      case 'date': {
        return 'LL'
      }
      case 'datetime':
      default: {
        return 'lll'
      }
    }
  }

  // Measure width of hidden Text element to adjust input width
  measureView (event) {
    this.setState(
      {
        inputWidth: event.nativeEvent.layout.width
      }
    )
  }

  // On android, it seems that 00:00 belongs to the previous date (->24:00), this causes a 1 day offset for min an max dates
  // e.g. minDate '02.01.2018 00:00' would allow the user to select '01.01.2018'
  // TODO: CG check if this correction is needed on different android versions..
  correctBoundsForAndroidPicker (date) {
    if (Platform.OS === 'android' && moment(date).format('HH:mm') === '00:00') {
      // add 1 day to correct the unwanted offset
      return moment(date).add(1, 'days').toDate()
    } else return date
  }

  render () {
    const {currentMessage} = this.props
    let icon = 'calendar-blank'
    if (currentMessage.custom.mode === 'datetime') icon = 'calendar-clock'
    if (currentMessage.custom.mode === 'time') icon = 'clock'
    // <Text onLayout={(event) => this.measureView(event)} style={[{}, styles.dateText]}>{this.state.date ? moment(this.state.date).format(this.formatDateForClient()) : currentMessage.custom.placeholder}</Text>
    return (
      <Animatable.View useNativeDriver animation={this.shouldAnimate ? this.props.fadeInAnimation : null} duration={this.props.duration} style={[inputMessageStyles.container]} onAnimationEnd={() => { this.shouldAnimate = false }} >
        <View style={styles.inputBubble}>
          {/* To adjust the width of the Input-Field dynamically by it's content,
          we need to create a hidden Text view with the same content and measure it using onLayout.
          This is quiet dirty, but until now, it seems to be the only working way.
          See: https://stackoverflow.com/a/33027556/4150548 */}
          <View style={{height: 0, overflow: 'hidden'}}>
            <Text onLayout={(event) => this.measureView(event)} style={[styles.dateText, {position: 'absolute', color: 'transparent', top: -30}]}>{this.state.date ? moment(this.state.date).format(this.formatDateForClient()) : currentMessage.custom.placeholder}</Text>
          </View>
          <DatePicker
            onLayout={(event) => this.measureContainer(event)}
            style={{width: null}}
            date={this.state.date}
            mode={currentMessage.custom.mode}
            is24Hour
            locale={moment.locale()}
            format={this.formatDateForClient()}
            placeholder={currentMessage.custom.placeholder === '' ? ' ' : currentMessage.custom.placeholder}
            confirmBtnText={I18n.t('Common.confirm')}
            cancelBtnText={I18n.t('Common.abort')}
            minDate={this.minDate ? this.correctBoundsForAndroidPicker(this.minDate) : undefined}
            maxDate={this.maxDate ? this.correctBoundsForAndroidPicker(this.maxDate) : undefined}
            iconComponent={<Icon name={icon} containerStyle={{
              position: 'absolute',
              left: 0,
              marginLeft: 0
            }} type='material-community' size={24} color='#fff' />}
            customStyles={{
              dateInput: [styles.dateInput, {flex: 0, width: this.state.inputWidth}],
              dateText: [styles.dateText],
              placeholderText: [styles.dateText]
            // ... You can check the source to find the other keys.
            }}
            onDateChange={(string, date) => {
              // clear seconds (android time-picker sets seconds)
              date.setSeconds(0)
              date.setMilliseconds(0)
              this.setState({date})
            }}
           />
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
  button: {
    padding: 5
  },
  inputBubble: {
    flex: 0,
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
  dateInput: {
    marginLeft: 35,
    marginRight: 10,
    height: 30,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: Colors.buttons.common.text
  },
  dateText: {
    fontSize: 16,
    color: Colors.buttons.common.text
  }
})
