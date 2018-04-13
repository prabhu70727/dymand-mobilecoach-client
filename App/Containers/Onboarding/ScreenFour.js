import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native'
import {ifIphoneX} from 'react-native-iphone-x-helper'

import { connect } from 'react-redux'
import NextButton from '../../Components/NextButton'
import I18n from '../../I18n/I18n'
import SettingsActions from '../../Redux/SettingsRedux'
import MessageActions from '../../Redux/MessageRedux'
import { Colors, Images, Metrics } from '../../Themes/'

import GUIActions from '../../Redux/GUIRedux'

class ScreenFour extends Component {
  completeTutorial = () => {
    const {completeTutorial, sendGoIntention, enableSidemenuGestures} = this.props
    completeTutorial(true)
    const redirect = this.props.navigation.navigate
    sendGoIntention()
    enableSidemenuGestures()
    redirect('Chat')
  }

  render () {
    return (
      <View style={Styles.container}>
        <View style={Styles.imageContainer}>
          <View style={Styles.circle}>
            <Image style={Styles.coachImage} source={this.props.coach ? Images.coaches[this.props.coach] : Images.coaches[0]} />
          </View>
        </View>
        <View style={Styles.textContainer}>
          <Text style={Styles.subtitle}>{I18n.t('Onboarding.welcome')}</Text>
          <NextButton text={I18n.t('Onboarding.start')} onPress={() => {
            this.completeTutorial()
          }} />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    coach: state.settings.coach
  }
}

const mapStateToDispatch = dispatch => ({
  completeTutorial: (tutorialCompleted) => dispatch(SettingsActions.completeTutorial(tutorialCompleted)),
  sendGoIntention: () => dispatch(MessageActions.sendIntention(null, 'go', null)),
  enableSidemenuGestures: () => dispatch(GUIActions.enableSidemenuGestures())
})

export default connect(mapStateToProps, mapStateToDispatch)(ScreenFour)

const Styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', flexDirection: 'column', backgroundColor: Colors.onboarding.background},
  imageContainer: {flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff', ...ifIphoneX({ paddingTop: 40 })},
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
  },
  circle: {
    width: Metrics.screenWidth * (2 / 3),
    height: Metrics.screenWidth * (2 / 3),
    borderWidth: 2,
    borderRadius: Metrics.screenWidth * (2 / 3),
    borderColor: Colors.onboarding.background,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coachImage: {
    width: Metrics.screenWidth * (2 / 3) - 20,
    height: Metrics.screenWidth * (2 / 3) - 20
  }
})
