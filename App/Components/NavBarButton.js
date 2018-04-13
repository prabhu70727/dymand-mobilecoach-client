import React, {Component} from 'react'
import {TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types'

export default class NavButton extends Component {
  render () {
    const {icon, onPress, position, iconStyle} = this.props
    const style = position === 'left' ? { paddingLeft: 15, paddingRight: 10, paddingTop: 10, paddingBottom: 10 } : { paddingLeft: 10, paddingRight: 15, paddingTop: 10, paddingBottom: 10 }
    return (
      <TouchableOpacity style={style} onPress={onPress}>
        <Icon name={icon} {...iconStyle} />
      </TouchableOpacity>
    )
  }
}

NavButton.defaultProps = {
  iconStyle: {
    size: 25,
    color: '#FFFFFF'
  }
}

NavButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  position: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  iconStyle: PropTypes.object
}
