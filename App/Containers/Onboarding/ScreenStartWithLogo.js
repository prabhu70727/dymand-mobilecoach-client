import React, { Component } from 'react'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import { Text, View, Image, StyleSheet, Platform } from 'react-native'
import { connect } from 'react-redux'

import NextButton from '../../Components/NextButton'
import { Colors, Images } from '../../Themes/'
import I18n from '../../I18n/I18n'
import MessageActions from '../../Redux/MessageRedux'

// Adjust to the appropriate next screen
const nextScreen = 'ScreenLanguageSelection'

class ScreenStartWithLogo extends Component {
  render () {
    const {sendPlatformIntention} = this.props
    const { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logoImage} source={Images.appLogo} />
          </View>
          <View style={styles.poweredByContainer}>
            <Image style={styles.poweredByImage} source={Images.poweredByLogo} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{I18n.t('Onboarding.title')}</Text>
          <Text style={styles.subtitle}>{I18n.t('Onboarding.subtitle')}</Text>
          <NextButton text={I18n.t('Onboarding.next')} onPress={() => {
            sendPlatformIntention(Platform.OS)
            navigate(nextScreen)
          }} />
        </View>
      </View>
    )
  }
}

const mapStateToDispatch = dispatch => ({
  sendPlatformIntention: (platform) => dispatch(MessageActions.sendIntention(null, 'platform', platform))
})

export default connect(null, mapStateToDispatch)(ScreenStartWithLogo)

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', flexDirection: 'column', backgroundColor: Colors.onboarding.background},
  imageContainer: {flex: 1, alignSelf: 'stretch', padding: 20, backgroundColor: '#fff', ...ifIphoneX({ paddingTop: 40 })},
  logoContainer: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  poweredByContainer: {height: 40, alignItems: 'center'},
  logoImage: {flex: 1, resizeMode: 'contain'},
  poweredByImage: {flex: 1, resizeMode: 'contain'},
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginHorizontal: 30
  },
  title: {fontSize: 30, fontWeight: 'bold', color: Colors.onboarding.text, textAlign: 'center'},
  subtitle: {
    color: Colors.onboarding.text,
    textAlign: 'center',
    fontSize: 20
  }
})
