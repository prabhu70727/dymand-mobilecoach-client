import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {View, StyleSheet, Dimensions} from 'react-native'
import { connect } from 'react-redux'
import {List, ListItem} from 'react-native-elements'
import {ifIphoneX} from 'react-native-iphone-x-helper'

import ResponsiveImage from './ResponsiveImage'
import I18n from '../I18n/I18n'
import Icon from 'react-native-vector-icons/Ionicons'
import ServerMessageActions from '../Redux/MessageRedux'
import StoryProgressActions from '../Redux/StoryProgressRedux'
import { Images, Colors } from '../Themes/'
import {badgeStyles} from './Badge'

import Log from '../Utils/Log'
const log = new Log('Components/Menu')

const {width} = Dimensions.get('window')

class Menu extends Component {
  constructor (props) {
    super(props)
    this.screens = {
      chat: {
        name: 'Chat',
        label: 'Menu.Chat',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        modal: false,
        badge: () => this.getChatBadge()
      },
      tour: {
        name: 'Tour',
        label: 'Menu.Tour',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        subtitle: '',
        modal: false
      },
      backpack: {
        name: 'Backpack',
        label: 'Menu.Backpack',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        subtitle: '',
        modal: false
      },
      diary: {
        name: 'FoodDiary',
        label: 'Menu.Diary',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        subtitle: '',
        modal: false,
        navigationOptions: {initialTab: 0}
      },
      settings: {
        name: 'Settings',
        label: 'Menu.Settings',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        subtitle: '',
        modal: false
      },
      recipes: {
        name: 'Recipes',
        label: 'Menu.Recipes',
        leftIcon: <View style={styles.circle}><Icon name='ios-nutrition' style={styles.actionButtonIcon} /></View>,
        subtitle: '',
        modal: false
      }
    }
  }

  getChatBadge () {
    if (this.props.unreadMessages === 0) return null
    else {
      let value = this.props.unreadMessages
      if (value > 99) value = '99+'
      return ({
        value,
        textStyle: badgeStyles.textStyle,
        containerStyle: badgeStyles.containerStyle
      })
    }
  }
  // remember the screens visited before returning to chat
  storeVisitedScreen (screen) {
    if (!this.state.visitedScreens.includes(screen)) this.setState({visitedScreens: [...this.state.visitedScreens, screen]})
  }

  getList () {
    const {storyProgress} = this.props
    let list = [this.screens.chat]
    // backpackActivated: false,
    // diaryActivated: false,
    // tourActivated: false
    if (storyProgress.tourActivated === true) list.push(this.screens.tour)
    if (storyProgress.backpackActivated === true) list.push(this.screens.backpack)
    if (storyProgress.recipesActivated === true) list.push(this.screens.recipes)
    if (storyProgress.diaryActivated === true) list.push(this.screens.diary)
    list.push(this.screens.settings)
    return list
  }

  onPressHandler (screen) {
    log.action('GUI', 'ScreenChange', screen.name)
    // Store the screen in visited screens
    if (screen.name === 'Backpack') this.props.visitScreen('backpack')
    if (screen.name === 'FoodDiary') this.props.visitScreen('diary')
    if (screen.name === 'Tour') this.props.visitScreen('tour')
    this.props.onItemSelected({screen: screen.name, modal: screen.modal, navigationOptions: screen.navigationOptions})
  }

  render () {
    let imageWidth = Math.min(2 / 3 * width - 50, 300) // sidemenu is 2/3 of screen
    return (
      <View style={styles.container}>
        <View style={{flex: 1}}>
          <View style={{alignItems: 'center', marginTop: 40, marginBottom: 30, ...ifIphoneX({ paddingTop: 20 })}}>
            <ResponsiveImage style={{alignSelf: 'center', zIndex: 100}} width={imageWidth} source={Images.appLogo} />
          </View>
          <List containerStyle={styles.listContainer}>
            {
            this.getList().map((l, i) => (
              <ListItem
                // roundAvatar
                onPress={() => this.onPressHandler(l)}
                // leftIcon={l.leftIcon}
                key={i}
                title={I18n.t(l.label, {locale: this.props.language})}
                // subtitle={l.subtitle}
                hideChevron
                badge={l.badge ? l.badge() : null}
                titleStyle={{color: Colors.sideMenu.text}}
              />
            ))
          }
          </List>
        </View>
        <View style={{alignItems: 'center', marginBottom: 20, marginTop: 20}}>
          <ResponsiveImage style={{alignSelf: 'center', zIndex: 100, ...ifIphoneX({ paddingBottom: 20 })}} width={imageWidth - 40} source={Images.poweredByLogo} />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.settings.language,
    storyProgress: state.storyProgress,
    coach: state.settings.coach,
    unreadMessages: state.guistate.unreadMessages
  }
}

const mapStateToDispatch = dispatch => ({
  sendIntention: (text, intention, content) => dispatch(ServerMessageActions.sendIntention(text, intention, content)),
  resetVisitedScreens: () => dispatch(StoryProgressActions.resetVisitedScreens()),
  visitScreen: (visitedScreen) => dispatch(StoryProgressActions.visitScreen(visitedScreen))
})

export default connect(mapStateToProps, mapStateToDispatch)(Menu)

Menu.propTypes = {
  onItemSelected: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRightColor: '#bbb',
    borderRightWidth: 1,
    backgroundColor: Colors.sideMenu.background
  },
  listContainer: {
    marginBottom: 20,
    marginTop: 0,
    backgroundColor: Colors.sideMenu.buttonBackground
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: '#bbb'
  },
  circle: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderRadius: 35 / 2,
    borderColor: '#bbb',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  image: {flex: 1, alignSelf: 'stretch', resizeMode: 'contain'}
})
