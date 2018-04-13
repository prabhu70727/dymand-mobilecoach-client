import {DrawerNavigator} from 'react-navigation'

import {Animated, Easing} from 'react-native'

// import all screens here
import Chat from '../Containers/Chat/Chat'
import OnboardingNav from '../Containers/Onboarding/OnboardingNav'
import LoadingContainer from '../Containers/LoadingContainer'
import Tour from '../Containers/Tour/Tour'
import Backpack from '../Containers/Backpack/Backpack'
import Recipes from '../Containers/Recipes/Recipes'
import Settings from '../Containers/Settings/Settings'
import FoodDiary from '../Containers/FoodDiary/FoodDiary'

// https://github.com/react-community/react-navigation/issues/1254
const noTransitionConfig = () => ({
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
    easing: Easing.step0
  }
})

// Manifest of possible screens
const PrimaryNav = DrawerNavigator({
  LoadingContainer: {
    path: '/loading',
    screen: LoadingContainer
  },
  OnboardingNav: {
    path: '/intro',
    screen: OnboardingNav
  },
  Chat: {
    path: '/chat',
    screen: Chat,
    test: 'test'
  },
  Tour: {
    path: '/tour',
    screen: Tour
  },
  Backpack: {
    path: '/backpack',
    screen: Backpack
  },
  Settings: {
    path: '/settings',
    screen: Settings
  },
  FoodDiary: {
    path: '/diary',
    screen: FoodDiary
  },
  Recipes: {
    path: '/recipes',
    screen: Recipes
  }
}, {
  // Default config for all screens
  headerMode: 'none',
  transitionConfig: noTransitionConfig,
  initialRouteName: 'LoadingContainer',
  // LoadingContainer
  // mode: 'modal'
  navigationOptions: {
    gesturesEnabled: false,
    drawerLockMode: 'locked-closed' // turn of the drawer: we use our own side-menu component
    // headerStyle: styles.header
  }
})

export default PrimaryNav
