import React, {Component} from 'react'
import {Platform} from 'react-native'
import {connect} from 'react-redux'
import NavigationBar from 'react-native-navbar'
import {ifIphoneX} from 'react-native-iphone-x-helper'

import {Metrics, Colors} from '../Themes/'
import NavBarButton from '../Components/NavBarButton'
import GUIActions from '../Redux/GUIRedux'

class PMNavigationBar extends Component {
  render () {
    const {title, toggleSideMenu, rightButton} = this.props
    return (
      <NavigationBar
        {...NavigationBarStyles}
        title={{
          title: title,
          tintColor: NavigationBarStyles.title.tintColor
        }}
        leftButton={
          <NavBarButton
            position='left'
            icon='ios-menu'
            onPress={() => toggleSideMenu()} />
        }
        rightButton={rightButton}
      />
    )
  }
}

const NavigationBarStyles = {
  containerStyle: {
    height: Metrics.navbarHeight,
    ...Platform.select({
      ios: {
        ...ifIphoneX({
          height: Metrics.navbarHeight + 40,
          paddingTop: 20
        }, {
          height: Metrics.navbarHeight + 20
        })
      },
      android: {
        paddingTop: 0
      }
    }),
    justifyContent: 'center',
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 2
    },
    // We don't need zIndex on Android, disable it since it's buggy
    zIndex: Platform.OS === 'android' ? 0 : 1,
    backgroundColor: Colors.navigationBar.background
  },
  statusBar: {
    style: 'light-content',
    hidden: false
  },
  title: {
    tintColor: 'white',
    height: 50
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.settings.language,
    coach: state.settings.coach,
    messages: state.giftedchatmessages,
    guistate: state.guistate
  }
}

const mapStateToDispatch = dispatch => ({
  toggleSideMenu: () => dispatch(GUIActions.toggleSideMenu())
})

export default connect(mapStateToProps, mapStateToDispatch)(PMNavigationBar)
