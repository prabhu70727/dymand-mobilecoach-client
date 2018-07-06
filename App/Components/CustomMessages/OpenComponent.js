import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import Button from 'react-native-button'
import PropTypes from 'prop-types'
import {Colors} from '../../Themes/'
import { Icon } from 'react-native-elements'
import * as Animatable from 'react-native-animatable'

export default class OpenComponent extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    onPress: PropTypes.func,
    setAnimationShown: PropTypes.func,
    icon: PropTypes.string,
    iconType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.shouldAnimate = this.props.currentMessage.custom.shouldAnimate
  }

  render () {
    const {currentMessage, onPress, icon, iconType} = this.props
    return (
      <Animatable.View
        useNativeDriver
        animation={this.shouldAnimate ? this.props.fadeInAnimation : null}
        duration={this.props.duration}
        style={[styles.container, currentMessage.previousMessage.type === 'open-component' ? {marginTop: 0} : null]}
        onAnimationEnd={() => { this.shouldAnimate = false }}
      >
        <Button
          containerStyle={styles.buttonContainer}
          disabledContainerStyle={[styles.buttonDisabled]}
          disabled={currentMessage.custom.disabled}
          style={[styles.button, icon ? {paddingLeft: 30} : null]}
          onPress={() => {
            onPress(currentMessage.custom.component)
          }}>
          {icon ? <Icon name={icon} type={iconType} size={20} color={Colors.buttons.openComponent.text} containerStyle={{position: 'absolute', left: 0}} /> : null}
          {currentMessage.custom.buttonTitle}
          {/* this.renderInteractionBadge() */}
        </Button>
      </Animatable.View>
    )
  }

  componentDidMount () {
    // notify redux that animationw as shown after first render
    const {currentMessage} = this.props
    if (currentMessage.custom.shouldAnimate) {
      this.props.setAnimationShown(currentMessage._id)
    }
  }

  // Possible icons: asterisk, mountains, alert-octagram
  renderInteractionBadge () {
    // const {currentMessage, onPress} = this.props
    return (
      <View style={styles.badgeContainer}>
        <Icon name='asterisk' type='font-awesome' size={15} color='#fff' />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -16,
    right: -23,
    height: 11,
    width: 11,
    borderColor: '#EC5352',
    borderWidth: 11,
    borderRadius: 11
  },
  container: {
    marginVertical: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 250,
    padding: 10,
    minHeight: 35,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: Colors.buttons.openComponent.background,
    marginBottom: 2
  },
  button: {
    fontSize: 16,
    color: Colors.buttons.openComponent.text,
    fontWeight: 'normal'
  },
  buttonDisabled: {
    backgroundColor: Colors.buttons.openComponent.disabled
  }
})
