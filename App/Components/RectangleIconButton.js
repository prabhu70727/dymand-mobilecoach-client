import React, {Component} from 'react'
import {View, TouchableOpacity, Text} from 'react-native'
import PropTypes from 'prop-types'
import {Icon} from 'react-native-elements'

class RectangleIconButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    containerStyle: PropTypes.object,
    color: PropTypes.string,
    onPress: PropTypes.func,
    type: PropTypes.string,
    width: PropTypes.number.isRequired
  }

  render () {
    return (
      <View style={styles.containerView}>
        <TouchableOpacity onPress={this.props.onPress} style={[styles.buttonStyle, {backgroundColor: this.props.backgroundColor, width: this.props.width, height: this.props.width}]}>
          <Icon name={this.props.icon} type={this.props.type} size={(this.props.width > 95) ? 40 : 35} iconStyle={{color: this.props.color}} />
          <Text style={[styles.title, {color: this.props.color}, (this.props.width > 95) ? null : {fontSize: 11, marginTop: 0}]}>{this.props.title}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = {
  containerView: {
    margin: 20,
    marginLeft: 0
  },
  buttonStyle: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center'
  }
}

export default RectangleIconButton
