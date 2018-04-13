import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native'
import {Colors} from '../Themes'

export default class NextButton extends Component {
  render ({ onPress, styleButton, styleText } = this.props) {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity onPress={onPress}>
          <View style={[Styles.button, styleButton]}>
            <Text style={[Styles.buttonText, styleText]}>{this.props.text}</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      // Hacky solution to mimic a border with radius on android, because a real borderradius causes buggy layouts with touchableOpacity
      return (
        <TouchableOpacity onPress={onPress}>
          <View style={Styles.border}>
            <View style={[Styles.button, styleButton]}>
              <Text style={[Styles.buttonText, styleText]}>{this.props.text}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
  }
}

// defaults can be overwritten
const Styles = StyleSheet.create({
  border: {
    backgroundColor: Colors.onboarding.text,
    borderRadius: 52,
    padding: 2
  },
  nextButton: {
    color: Colors.onboarding.text,
    fontSize: 30
  },
  // Button container
  button: {
    borderRadius: 50,
    ...Platform.select({
      ios: {
        borderWidth: 2
      },
      android: {
        borderWidth: 0,
        backgroundColor: Colors.onboarding.background
      }
    }),
    borderColor: Colors.onboarding.text,
    paddingHorizontal: 50,
    paddingVertical: 10,
    alignSelf: 'stretch'
  },
  // Button text
  buttonText: {
    color: Colors.onboarding.text,
    textAlign: 'center',
    fontSize: 20
  }
})
