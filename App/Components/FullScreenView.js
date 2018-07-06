import React, {Component} from 'react'
import {View} from 'react-native'
import PropTypes from 'prop-types'
import HeaderBar from './HeaderBar'

export default class FullScreenView extends Component {
  static propTypes = {
    title: PropTypes.string,
    onBack: PropTypes.func,
    onClose: PropTypes.func,
    backgroundColor: PropTypes.string
  }

  static defaultProps = {
    backgroundColor: '#fff'
  }

  render () {
    return (
      <View style={[styles.fullScreenStyle, {backgroundColor: this.props.backgroundColor}]}>
        <HeaderBar title={this.props.title} onBack={this.props.onBack} onClose={this.props.onClose} />
        {this.props.children}
      </View>
    )
  }
}

const styles = {
  fullScreenStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
}
