import React, {Component} from 'react'
import {View, Text, StyleSheet, Platform, TouchableOpacity, Alert, ViewPropTypes} from 'react-native'
import I18n from '../I18n/I18n'
import PropTypes from 'prop-types'
import { Icon } from 'react-native-elements'
import {Colors, Fonts, Metrics} from '../Themes/'
import {ifIphoneX} from 'react-native-iphone-x-helper'

const iconProps = {
  size: 30,
  color: Colors.navigationBar.text
}

export default class HeaderBar extends Component {
  static propTypes = {
    title: PropTypes.string,
    onBack: PropTypes.func,
    onClose: PropTypes.func,
    confirmClose: PropTypes.string,
    containerStyle: ViewPropTypes.style
  }

  renderBackIcon () {
    if (this.props.onBack) {
      return (
        <TouchableOpacity style={styles.backButton} onPress={() => this.props.onBack()}>
          <Icon name='ios-arrow-back' type='ionicon' {...iconProps} />
        </TouchableOpacity>
      )
    }
  }

  renderCloseIcon () {
    if (this.props.onClose) {
      return (
        <TouchableOpacity style={styles.closeButton} onPress={() => this.onCloseHandler()}>
          <Icon name='md-close' type='ionicon' {...iconProps} />
        </TouchableOpacity>
      )
    }
  }

  onCloseHandler () {
    if (this.props.confirmClose) {
      Alert.alert(
          this.props.confirmClose,
          '',
        [
          {text: I18n.t('Settings.no'), onPress: () => {}, style: 'cancel'},
          {text: I18n.t('Settings.yes'), onPress: this.props.onClose}
        ],
          { cancelable: false }
        )
    } else this.props.onClose()
  }

  render () {
    return (
      <View style={[styles.header, this.props.containerStyle]}>
        <Text style={styles.title}>{this.props.title}</Text>
        {this.renderBackIcon()}
        {this.renderCloseIcon()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: Metrics.navbarHeight,
    ...Platform.select({
      ios: {
        marginTop: 20
      },
      android: {
        marginTop: 0
      }
    }),
    ...ifIphoneX({
      marginTop: 40
    }),
    backgroundColor: Colors.navigationBar.background,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    borderBottomWidth: 1,
    borderTopWidth: 1
  },
  title: {
    fontSize: Fonts.size.regular,
    fontWeight: '200',
    color: Colors.navigationBar.text,
    textAlign: 'center'
  },
  backButton: {
    // fontSize: 30,
    position: 'absolute',
    left: 15,
    padding: 8
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    padding: 8
  }
})
