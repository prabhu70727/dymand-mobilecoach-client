import {StackNavigator} from 'react-navigation'

import ScreenOne from './ScreenOne'
import ScreenTwo from './ScreenTwo'
import ScreenThree from './ScreenThree'
import ScreenFour from './ScreenFour'

// Manifest of possible screens
const OnboardingNav = StackNavigator({
  ScreenOne: {
    screen: ScreenOne
  },
  ScreenTwo: {
    screen: ScreenTwo
  },
  ScreenThree: {
    screen: ScreenThree
  },
  ScreenFour: {
    screen: ScreenFour
  }

}, {
  headerMode: 'none',
  initialRouteName: 'ScreenOne',
  navigationOptions: {
    gesturesEnabled: false
  }
})

export default OnboardingNav
