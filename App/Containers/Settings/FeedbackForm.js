
// TODO for improvement check: https://github.com/idibidiart/react-native-responsive-grid/blob/master/UniversalTiles.md

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import I18n from '../../I18n/I18n'
import PropTypes from 'prop-types'
import { FormLabel, FormInput, FormValidationMessage } from 'react-native-elements'

import NextButton from '../../Components/NextButton'
import {Colors} from '../../Themes/'

export default class FeedbackForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onFeedbackFocus: PropTypes.func
  }

  state = {
    name: '',
    email: '',
    errorDescription: '',
    submitPressed: false,
    submitted: false
  }

  render () {
    if (!this.state.submitted) return this.renderForm()
    else return this.renderSuccessMessage()
  }

  renderForm () {
    return (
      <View>
        <FormLabel labelStyle={styles.labelStyle}>{I18n.t('Settings.feedbackForm.nameInput')}</FormLabel>
        <FormInput
          inputStyle={styles.formInput}
          containerStyle={styles.inputContainer}
          onChangeText={(name) => this.setState({name})}
        />
        <FormLabel labelStyle={styles.labelStyle}>{I18n.t('Settings.feedbackForm.emailInput')}</FormLabel>
        <FormInput
          inputStyle={styles.formInput}
          containerStyle={styles.inputContainer}
          onChangeText={(email) => this.setState({email})}
        />
        <FormLabel labelStyle={styles.labelStyle}>{I18n.t('Settings.feedbackForm.feedbackInput')}</FormLabel>
        <FormInput
          onFocus={this.props.onFeedbackFocus}
          inputStyle={[styles.formInput, {minHeight: 72}]}
          containerStyle={styles.inputContainer}
          multiline
          onChangeText={(errorDescription) => this.setState({errorDescription})}
        />
        {!this.inputValid() && this.state.submitPressed ? <FormValidationMessage labelStyle={styles.inputContainer}>{I18n.t('Settings.feedbackForm.errorMessage')}</FormValidationMessage> : null}
        <NextButton
          styleButton={styles.button}
          styleText={styles.buttonText}
          text={I18n.t('Settings.feedbackForm.submit')}
          onPress={() => this.onSubmitHandler()}
        />
      </View>
    )
  }

  renderSuccessMessage () {
    return (
      <View>
        <Text style={styles.headline}>{I18n.t('Common.thanks')}</Text>
        <Text>{I18n.t('Settings.feedbackForm.submitMessage')}</Text>
      </View>
    )
  }

  onSubmitHandler () {
    if (this.inputValid()) {
      this.setState({submitted: true}, () => this.props.onSubmit(this.state.name, this.state.email, this.state.errorDescription))
    } else this.setState({submitPressed: true})
  }

  inputValid () {
    if (this.state.errorDescription !== '') return true
    return false
  }
}

const styles = StyleSheet.create({
  formInput: {
    marginLeft: 0,
    marginRight: 0,
    width: undefined,
    color: Colors.main.paragraph
  },
  inputContainer: {
    marginLeft: 0,
    marginRight: 0
  },
  headline: {
    color: Colors.main.headline,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  labelStyle: {
    marginLeft: 0,
    marginRight: 0,
    width: undefined,
    color: Colors.main.paragraph,
    fontWeight: 'normal'
  },
  button: {backgroundColor: Colors.buttons.common.background, borderRadius: 20, marginVertical: 10, marginTop: 30},
  buttonText: {color: Colors.buttons.common.text, fontSize: 16}
})
