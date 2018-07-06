import React, {Component} from 'react'
import {Platform, View} from 'react-native'
import {connect} from 'react-redux'
import NavigationBar from 'react-native-navbar'
import {ifIphoneX} from 'react-native-iphone-x-helper'

import {Metrics, Colors} from '../Themes/'
import NavBarButton from './NavBarButton'
import GUIActions from '../Redux/GUIRedux'
import Badge from './Badge'

class PMNavigationBar extends Component {
  render () {
    const {title, toggleSideMenu, rightButton} = this.props
    return (
      <View style={styles.wrapper}>
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
        <Badge containerStyle={styles.badgeContainer} onPress={() => toggleSideMenu()} />
      </View>
    )
  }
}
const badgeTopPosition = Metrics.navbarHeight / 2 - 19
const styles = {
  wrapper: {
    backgroundColor: Colors.navigationBar.background,
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: {
      height: 2
    },
    // We don't need zIndex on Android, disable it since it's buggy
    zIndex: Platform.OS === 'android' ? 0 : 1
  },
  badgeContainer: {
    position: 'absolute',
    elevation: 5,
    ...Platform.select({
      ios: {
        ...ifIphoneX({
          top: badgeTopPosition + 40
        }, {
          top: badgeTopPosition + 20
        })
      },
      android: {
        top: badgeTopPosition
      }
    }),
    left: 24,
    justifyContent: 'center',
    alignItems: 'flex-start'
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
