import React, {Component} from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types'

export default class LeftNavButton extends Component {
  render () {
    return (
      <TouchableOpacity style={{marginRight: 15, marginTop: 10}} onPress={this.props.onPress}>
        <Icon name={this.props.icon} {...iconStyles} />
      </TouchableOpacity>
    )
  }
}

const iconStyles = {
  size: 25,
  color: '#FFFFFF'
}

LeftNavButton.PropTypes = {
  onPress: PropTypes.func.isRequired
}
