import React, { Component } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import { connect } from 'react-redux'

import I18n from '../../I18n/I18n'
import SettingsActions from '../../Redux/SettingsRedux'
import { Colors, Metrics, Images } from '../../Themes/'
import MessageActions from '../../Redux/MessageRedux'

// Adjust to the appropriate next screen
// const nextScreen = 'ScreenWelcomeByCoach'
const nextScreen = 'ScreenWelcomeByCoach'

class ScreenCoachSelection extends Component {
  render () {
    const {chooseCoach, sendCoachIntention} = this.props
    const coaches = Images.coaches
    const {navigate} = this.props.navigation

    return (
      <View style={Styles.container}>
        <View style={Styles.containerMargin} />
        <View style={{marginHorizontal: 30, flex: 0.5}}>
          <View style={Styles.imageContainer}>
            {coaches.map((coach, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  chooseCoach(index)
                  sendCoachIntention(I18n.t('Coaches.' + index))
                  navigate(nextScreen)
                }}>
                <View style={Styles.circle}>
                  <Image style={Styles.coachImage} source={coach} />
                </View>
                <Text style={Styles.coachText}>{I18n.t('Coaches.' + index)}</Text>
              </TouchableOpacity>
             ))}
          </View>
        </View>
        <View style={Styles.textContainer}>
          <Text style={Styles.subtitle}>{I18n.t('Onboarding.chooseCoach')}</Text>
        </View>
      </View>
    )
  }
}

const mapStateToDispatch = dispatch => ({
  chooseCoach: (coach) => dispatch(SettingsActions.chooseCoach(coach)),
  sendCoachIntention: (coachName) => dispatch(MessageActions.sendIntention(null, 'coach', coachName))
})

export default connect(null, mapStateToDispatch)(ScreenCoachSelection)

const Styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', backgroundColor: Colors.onboarding.background, ...ifIphoneX({ paddingTop: 40 })},
  containerMargin: {flex: 0.3},
  imageContainer: {flex: 0.7, flexDirection: 'row', justifyContent: 'space-around'},
  image: {flex: 1, alignSelf: 'stretch', resizeMode: 'contain'},
  textContainer: {flex: 0.35, justifyContent: 'flex-start'},
  subtitle: {
    color: Colors.onboarding.text,
    textAlign: 'center',
    fontSize: 20
  },
  circle: {
    width: Metrics.screenWidth / 3,
    height: Metrics.screenWidth / 3,
    borderWidth: 2,
    borderRadius: Metrics.screenWidth / 3 / 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coachImage: {
    width: Metrics.screenWidth / 3 - 20,
    height: Metrics.screenWidth / 3 - 20
  },
  coachText: {
    color: Colors.onboarding.text,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 20
  }
})
