import React, {Component} from 'react'
import {View, Platform} from 'react-native'
import PropTypes from 'prop-types'
import HeaderBar from './HeaderBar'
import {ifIphoneX} from 'react-native-iphone-x-helper'

export default class FullScreenView extends Component {
  static propTypes = {
    title: PropTypes.string,
    onBack: PropTypes.func
  }

  render () {
    return (
      <View style={styles.fullScreenStyle}>
        <HeaderBar title={this.props.title} onBack={this.props.onBack} containerStyle={(Platform.OS === 'ios') ? {marginTop: 0} : null} />
        {this.props.children}
      </View>
    )
  }
}

const styles = {
  fullScreenStyle: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 20
      },
      android: {
        top: 0
      }
    }),
    ...ifIphoneX({
      top: 40
    }),
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#fff'
  }
}
