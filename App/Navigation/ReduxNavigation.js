import React, {Component} from 'react'
import { addNavigationHelpers } from 'react-navigation'
import { View, BackHandler, Linking, Animated } from 'react-native'
import { connect } from 'react-redux'
import Toast, {DURATION} from 'react-native-easy-toast'
import SideMenu from 'react-native-side-menu'
import RNExitApp from 'react-native-exit-app'

import AppConfig from '../Config/AppConfig'
import AppNavigation from './AppNavigation'
import GUIActions from '../Redux/GUIRedux'
import {Colors} from '../Themes'
import Menu from '../Components/Menu'
import ModalContent from '../Containers/ModalContent'
import { initialRouteName } from '../Containers/Onboarding/OnboardingNav'
import I18n from '../I18n/I18n'
import LoadingOverlay from '../Components/LoadingOverlay'
import StoryProgressActions from '../Redux/StoryProgressRedux'
import ServerMessageActions from '../Redux/MessageRedux'
import Log from '../Utils/Log'

const log = new Log('Navigation/ReduxNavigation')

const WWW_URL_PATTERN = /^www\./i

const sideMenuAnimation = (prop, value) => Animated.spring(prop, {
  toValue: value,
  friction: 8,
  useNativeDriver: true
})

// here is our redux-aware our smart component
class ReduxNavigation extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modal: {
        visible: false,
        type: '',
        onClose: null,
        content: null
      }
    }
    this.enableClose = false
  }

  _getCurrentRouteName (navState) {
    if (navState.hasOwnProperty('index')) {
      // search for screen name in nested navigations recursively
      return this._getCurrentRouteName(navState.routes[navState.index])
    } else {
      return navState.routeName
    }
  }

  componentDidMount () {
    // Add Event-Handler for Android Back Button
    BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackPress)
  }

  handleHardwareBackPress = () => {
    const {dispatch} = this.props
    const {nav} = this.props
    const navigation = addNavigationHelpers({
      dispatch,
      state: nav
    })
    let currentScreen = this._getCurrentRouteName(nav)
    log.info('Hardware Back-Button has been pressed in', currentScreen)
    if (this.state.modal.visible) {
      log.info('Hiding Modal')
      this.hideModal()
      return true
    }
    // If we're not in Chat-Screen or in first onboarding screen
    if (currentScreen !== 'Chat' && currentScreen !== initialRouteName) {
      // Navigate back to last Screen if back button is active in onboarding or we already left onboarding
      if (AppConfig.config.startup.backButtonInOnboardingEnabled || this.props.tutorialCompleted) {
        const {visitedScreens} = this.props.storyProgress
        if (visitedScreens.length > 0) {
          visitedScreens.forEach(screen => {
            dispatch(ServerMessageActions.sendIntention(null, screen + '-opened', null))
          })
          // clear visited screens again
          dispatch(StoryProgressActions.resetVisitedScreens())
        }
        navigation.goBack(null)
      }
      return true
    // If we already are in Chat, show Tast or close App
    } else {
      // If the back button already has been pressed before, exit the app
      if (this.enableClose) {
        log.info('Back Button pressed twice: Leaving App.')
        RNExitApp.exitApp()
        return true
      } else {
        // Enable close for 2 seconds
        log.info('Back Button pressed once: Enabling exit option.')
        this.enableClose = true
        this.disableCloseAfter2Seconds()

        this.refs.toast.show(I18n.t('Common.backButton'), 2000)
        return true
      }
    }
  }

  async disableCloseAfter2Seconds () {
    setTimeout(() => {
      log.info('Waited two seconds: Disabling exit option.')
      this.enableClose = false
    }, 2000)
  }

  hideModal = () => {
    this.setState({
      modal: {
        visible: false,
        type: '',
        onClose: null,
        content: null
      }
    })
  }

  // universal url handler that can be used from child views
  openURL = (url) => {
    if (WWW_URL_PATTERN.test(url)) {
      this.openURL(`http://${url}`)
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          log.warn('No handler for URL:', url)
        } else {
          Linking.openURL(url)
        }
      })
    }
  }

  // Show a new Modal with the given Contents
  showModal = (type = null, content = null, onClose = () => {}) => {
    this.setState({
      modal: {
        visible: true,
        type,
        onClose: (argument1, argument2) => { // arguments are optional
          log.info("Showmodel is called")
          this.hideModal()
          this.props.dispatch(GUIActions.enableSidemenuGestures())
          onClose(argument1, argument2)
        },
        content
      },
      loading: false
    })
  }

  showLoadingOverlay = (cb) => {
    this.setState({
      loading: true
    }, cb)
  }

  hideLoadingOverlay = (cb) => {
    this.setState({
      loading: false
    }, cb)
  }

  onMenuItemSelected = ({screen = null, modal = true, navigationOptions = {}}) => {
    const { dispatch, nav } = this.props
    const navigation = addNavigationHelpers({
      dispatch,
      state: nav
    })

    dispatch(GUIActions.closeSideMenu())

    // if no screen provided
    if (!screen) return this.refs.toast.show('Under construction 😄', DURATION.LENGTH_LONG)
    // if same screen we do not do anything
    if (nav.routes[nav.index].routeName === screen) return
    // if only implemented for specific platform yet
    // if (screen === 'Tour' && Platform.OS === 'android') return this.refs.toast.show('Android Tour View is coming soon 😄', DURATION.LENGTH_LONG)

    // if should be shown as modal window
    if (modal) {
      this.setModal(!this.state.modal.visible, screen)
    } else {
      navigation.navigate(screen, navigationOptions)
    }
  }

  renderLoadingOverlay () {
    if (this.state.loading) return <LoadingOverlay />
    else return null
  }

  render () {
    const { dispatch, nav, sideMenuOpen, sideMenuGestures, language } = this.props
    I18n.locale = language // make sure that this is set before sidemenu is loaded
    const { modal } = this.state
    const navigation = addNavigationHelpers({
      dispatch,
      state: nav
    })
    const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator} />

    return (
      <View style={{flex: 1, backgroundColor: Colors.main.appBackground}}>
        <SideMenu
          menu={menu}
          animationFucntion={sideMenuAnimation}
          disableGestures={!sideMenuGestures}
          isOpen={sideMenuOpen}
          onChange={isOpen => {
            if (!isOpen) {
              dispatch(GUIActions.closeSideMenu()) // somehow this is needed?
            }
          }
          }
          >
          <ModalContent
            visible={modal.visible}
            type={modal.type}
            onClose={modal.onClose}
            content={modal.content}
          />
          <View style={{
            flex: 1
          }}>
            <AppNavigation navigation={navigation} screenProps={{
              openURL: (url) => this.openURL(url),
              showModal: (type, content, onClose) => this.showModal(type, content, onClose),
              showLoadingOverlay: (cb = () => {}) => this.showLoadingOverlay(cb),
              hideLoadingOverlay: (cb = () => {}) => this.hideLoadingOverlay(cb)
            }}
            />
          </View>
          <Toast
            ref='toast'
            style={{backgroundColor: Colors.toast.background}}
            position='center'
            positionValue={200}
            fadeInDuration={750}
            fadeOutDuration={1000}
            opacity={0.8}
            textStyle={{color: Colors.toast.text}}
          />
          {this.renderLoadingOverlay()}
        </SideMenu>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  nav: state.nav,
  language: state.settings.language,
  sideMenuOpen: state.guistate.sideMenuOpen,
  sideMenuGestures: state.guistate.sideMenuGestures,
  tutorialCompleted: state.settings.tutorialCompleted,
  storyProgress: state.storyProgress
})

export default connect(mapStateToProps)(ReduxNavigation)
