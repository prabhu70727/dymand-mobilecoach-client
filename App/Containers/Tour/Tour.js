import React, { Component } from 'react'
import {
  StyleSheet,
  Dimensions,
  View,
  Animated,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Text
} from 'react-native'
import LottieView from 'lottie-react-native'
import {connect} from 'react-redux'

import I18n from '../../I18n/I18n'
import PMNavigationBar from '../../Components/Navbar'
import TourActions from '../../Redux/TourRedux'
import InfoButton from '../../Components/InfoButton'
import AppConfig from '../../Config/AppConfig'

import {Metrics, Colors} from '../../Themes/'

import Log from '../../Utils/Log'
const log = new Log('Containers/Tour/Tour')

const {height, width} = Dimensions.get('window')

// adjust these to values of bodymovin source file
const sourceWidth = 625
const sourceHeight = 3640
const tourDurationInFrames = 2124

const halfScrollWindowHeight = height / 2 - Metrics.navbarHeight

/*
  //activate tour in menu
  {
    type: 'COMMAND_TO_EXECUTE', 'command': 'activate-tour'
  }

  //actions to get to different stages
  {
    type: 'SET_TOUR_STEP', tourStep: 'begin'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'tour-start'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-1-day-1'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-1-day-2'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-1-day-3'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'was-ich-esse-1'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-1'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-2'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-3'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-4'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-5'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-6'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-final'
  }

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-evaluation'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'lmp-advice'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'optimal-plate'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'meals'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'shopping'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'labels'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'preparation'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'storage'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'balanced-diet'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-2-day-1'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-2-day-2'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'period-2-day-3'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'was-ich-esse-2'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'add-topics'
  },

  {
    type: 'SET_TOUR_STEP', tourStep: 'tour-end'
  }
*/

const TOUR_STEPS = {
  'begin': {
    frameEnd: 0,
    sourcePixelTopPos: 0
  },
  // Prolog zw. 8 und 9
  'tour-start': {
    frameEnd: 186,
    sourcePixelTopPos: 140
  },
  // Tour End
  'tour-end': {
    frameEnd: 2124,
    sourcePixelTopPos: 3400
  }
}

for (const [key, val] of Object.entries(TOUR_STEPS)) {
  TOUR_STEPS[key].percentage = Number(val.frameEnd) / Number(tourDurationInFrames)
}

// TODO: Language switching
let tourSourceFile = null
if (Platform.OS === 'ios') {
  tourSourceFile = 'Web/de/' + AppConfig.config.whitelabel.tourFile
} else if (Platform.OS === 'android') {
  tourSourceFile = 'web/de/' + AppConfig.config.whitelabel.tourFile
}

class AnimatedTour extends Component {
  constructor (props) {
    super(props)
    const { tourSteps, currentLastSeenIndex } = props
    const lastSeenStep = tourSteps[currentLastSeenIndex]

    this.state = {
      progress: new Animated.Value(TOUR_STEPS[lastSeenStep].percentage)
    }
  }

  componentDidMount () {
    log.debug('Animation check')
    const self = this
    const { tourSteps } = self.props
    let lastStep = 'begin'
    let secondToLastStep = 'begin'

    if (Array.isArray(tourSteps) && tourSteps.length > 1) {
      lastStep = tourSteps.slice(-1)
      secondToLastStep = tourSteps.slice(-2, -1)
    }

    if (TOUR_STEPS[lastStep] === undefined) {
      log.warn('This tour step does not exist:', lastStep)
      return
    }

    if (TOUR_STEPS[secondToLastStep] === undefined) {
      log.warn('This tour step does not exist:', secondToLastStep)
      return
    }

    let top = Math.max(TOUR_STEPS[lastStep].sourcePixelTopPos * width / sourceWidth - halfScrollWindowHeight - 100, 0) // + halfScrollWindowHeight // + halfScrollWindowHeight + 100 //* height / sourceHeight + halfScrollWindowHeight

    // let top = Math.max(TOUR_STEPS[lastStep].sourcePixelTopPos / 3640 * 910 * width / sourceWidth - halfScrollWindowHeight - 100, 0) // + halfScrollWindowHeight // + halfScrollWindowHeight + 100 //* height / sourceHeight + halfScrollWindowHeight

    setTimeout(() => self.moveToLabel(secondToLastStep, lastStep), 700)
    setTimeout(() => self.refs._scrollView._component.scrollTo({x: 0, y: top, animated: false}), 0)

    // set the last seen index
    self.props.setLastSeenIndex(tourSteps.length - 1)
  }

  backToChat = () => {
    this.props.navigation.navigate('Chat')
  }

  getDuration (steps) {
    if (steps === 0) {
      return 0
    }
    if (steps === 1) {
      return 6000
    }
    if (steps === 2) {
      return 10000
    }
    if (steps >= 3) {
      return 14000
    }
  }

  renderNavigationbar (props) {
    let title = I18n.t('Tour.header')
    return (
      <PMNavigationBar title={title} props={props}
        rightButton={
          <InfoButton
            onPress={() => {
              Alert.alert(
                I18n.t('Tour.infoIconHeader'),
                 I18n.t('Tour.infoText'),
                [
                  {text: 'Ok', onPress: () => true}
                ],
                { cancelable: false }
              )
            }}
            />}
        />
    )
  }

  moveToLabel = (secondToLastStep, lastStep) => {
    const lastIndex = Math.max(Object.keys(TOUR_STEPS).indexOf(secondToLastStep.toString()), 0)
    const nextIndex = Math.max(Object.keys(TOUR_STEPS).indexOf(lastStep.toString()), 0)
    const value = TOUR_STEPS[lastStep].percentage
    Animated.timing(this.state.progress, {
      toValue: value,
      duration: this.getDuration(Math.abs(nextIndex - lastIndex))
    }).start()
  }

  renderInfoText = () => {
    if (this.props.currentLastSeenIndex <= 1) {
      return (
        <View>
          <View style={{backgroundColor: 'white', height: 1, zIndex: 100, opacity: 0.5}} />
          <View style={{backgroundColor: 'transparent', margin: 10}}>
            <Text style={{color: 'white', textAlign: 'center'}}> {I18n.t('Tour.infoText')} </Text>
          </View>
          <View style={{backgroundColor: 'white', height: 1, zIndex: 100, opacity: 0.5}} />
        </View>
      )
    } else {
      return (<View style={{backgroundColor: 'white', height: 1, zIndex: 100, opacity: 0.5}} />)
    }
  }

  render () {
    return (
      <View style={styles.container}>

        {this.renderNavigationbar(this.props)}

        {this.renderInfoText()}

        <Animated.ScrollView
          indicatorStyle='white'
          contentContainerStyle={styles.outerContainerStyle}
          ref='_scrollView'
          style={styles.animatedScrollView}
          >

          <LottieView
            source={tourSourceFile}
            style={styles.animationStyle}
            hardwareAcceleration
            // imageAssetsFolder='lottie' // [Android] Relative folder inside of assets containing image files to be animated: App/android/app/src/main/assets/lottie/
            progress={this.state.progress}
          />
          <TouchableWithoutFeedback
            onPress={() => this.backToChat()}>
            <View style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} />
          </TouchableWithoutFeedback>
        </Animated.ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'flex-start', backgroundColor: Colors.modules.tour.background},
  outerContainerStyle: {flexGrow: 1},
  animatedScrollView: {backgroundColor: 'transparent'},
  animationStyle: {
    ...Platform.select({
      ios: {
        width: width,
        height: width * sourceHeight / sourceWidth
      },
      // TODO: BUG: see https://github.com/airbnb/lottie-react-native/issues/214#issuecomment-355306742
      android: {
        width: width,
        marginVertical: height,
        height: height,
        transform: [{scale: 3}]
      }
    })
  }
})

const mapStateToProps = (state) => {
  return {
    tourSteps: state.tourStatus.tourSteps,
    currentLastSeenIndex: state.tourStatus.currentLastSeenIndex
  }
}

const mapStateToDispatch = dispatch => ({
  setLastSeenIndex: (lastSeenIndex) => dispatch(TourActions.setLastSeenIndex(lastSeenIndex))
})

export default connect(mapStateToProps, mapStateToDispatch)(AnimatedTour)
