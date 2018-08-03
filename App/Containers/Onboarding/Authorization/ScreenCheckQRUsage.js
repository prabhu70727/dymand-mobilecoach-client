import React, { Component } from 'react'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import { Text, View, Image, StyleSheet } from 'react-native'

import NextButton from './../../../Components/NextButton'
import { Colors, Images } from './../../../Themes/'
import I18n from './../../../I18n/I18n'

// Adjust to the appropriate next screen

class ScreenCheckQRUsage extends Component {
  render () {
    const { onNoQRAvailable, onQRAvailable } = this.props
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logoImage} source={Images.welcomeQr} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>{I18n.t('Onboarding.checkQrUsageSubtitle')}</Text>
          <NextButton text={I18n.t('Onboarding.qrAvailable')} onPress={onQRAvailable} />
          <NextButton text={I18n.t('Onboarding.qrNotAvailable')} onPress={onNoQRAvailable} />
        </View>
      </View>
    )
  }
}

export default ScreenCheckQRUsage

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', flexDirection: 'column', backgroundColor: Colors.onboarding.background},
  imageContainer: {flex: 1, alignSelf: 'stretch', padding: 20, backgroundColor: '#fff', ...ifIphoneX({ paddingTop: 40 })},
  logoContainer: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  logoImage: {flex: 1, maxWidth: 200, resizeMode: 'contain'},
  textContainer: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginHorizontal: 30,
    alignSelf: 'stretch'
  },
  title: {fontSize: 30, fontWeight: 'bold', color: Colors.onboarding.text, textAlign: 'center'},
  subtitle: {
    color: Colors.onboarding.text,
    textAlign: 'center',
    fontSize: 20
  }
})
