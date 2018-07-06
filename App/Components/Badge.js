import React, {Component} from 'react'
import {ViewPropTypes, TouchableWithoutFeedback} from 'react-native'
import {connect} from 'react-redux'
// import PropTypes from 'prop-types'
import * as Animatable from 'react-native-animatable'
import {Badge} from 'react-native-elements'

import {Colors} from '../Themes/'

export const strongPulse = {
  0: {
    scale: 1
  },
  0.5: {
    scale: 1.3
  },
  1: {
    scale: 1
  }
}

Animatable.initializeRegistryWithDefinitions({
  strongPulse
})

class NewMessagesBadge extends Component {
  static propTypes = {
    containerStyle: ViewPropTypes.style
  }

  render () {
    if (this.props.unreadMessages > 0) {
      return (
        <TouchableWithoutFeedback onPress={this.props.onPress} >
          <Animatable.View style={this.props.containerStyle} animation='strongPulse' iterationDelay={1000} iterationCount='infinite' useNativeDriver>
            <Animatable.View animation='bounceIn' duration={600} useNativeDriver>
              <Badge value={this.props.unreadMessages <= 99 ? this.props.unreadMessages : '99+'} containerStyle={badgeStyles.containerStyle} textStyle={badgeStyles.textStyle} />
            </Animatable.View>
          </Animatable.View>
        </TouchableWithoutFeedback>
      )
    } else return null
  }
}

export const badgeStyles = {
  containerStyle: {
    backgroundColor: Colors.badge.background,
    padding: 4,
    minWidth: 23
  },
  textStyle: {
    fontSize: 12,
    color: Colors.badge.text
  }
}

const mapStateToProps = (state) => {
  return {
    unreadMessages: state.guistate.unreadMessages
  }
}

export default connect(mapStateToProps)(NewMessagesBadge)
