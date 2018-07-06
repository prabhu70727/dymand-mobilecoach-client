import {StackNavigator} from 'react-navigation'

import ScreenStartWithLogo from './ScreenStartWithLogo'
import ScreenLanguageSelection from './ScreenLanguageSelection'
// import ScreenScreeningSurvey from './ScreenScreeningSurvey'
import ScreenCoachSelection from './ScreenCoachSelection'
import ScreenWelcomeByCoach from './ScreenWelcomeByCoach'

export const onboardingNav = 'OnboardingNav'
export const initialRouteName = 'ScreenStartWithLogo'

// Manifest of possible screens
const OnboardingNav = StackNavigator({
  // Start screen with logo
  ScreenStartWithLogo: {
    screen: ScreenStartWithLogo
  },
  // Language selection
  // Optional: Comment out if not needed and adjust jump in former Screen
  ScreenLanguageSelection: {
    screen: ScreenLanguageSelection
  },
  // Screening survey
  // Optional: Comment out if not needed and adjust jump in former Screen
  // ScreenScreeningSurvey: {
  //   screen: ScreenScreeningSurvey
  // },
  // Coach selection
  // Optional: Comment out if not needed and adjust jump in former Screen
  ScreenCoachSelection: {
    screen: ScreenCoachSelection
  },
  // Personal welcome by coach
  ScreenWelcomeByCoach: {
    screen: ScreenWelcomeByCoach
  }
}, {
  headerMode: 'none',
  initialRouteName,
  navigationOptions: {
    gesturesEnabled: false
  }
})

export default OnboardingNav
