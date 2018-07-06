import React, {Component} from 'react'
import Spinner from 'react-native-spinkit'
import PropTypes from 'prop-types'

import BlurView from './BlurView'

export default class LoadingOverlay extends Component {
  static propTypes = {
    type: PropTypes.string,
    color: PropTypes.string,
    size: PropTypes.number,
    backgroundOpacity: PropTypes.number
  }
  static defaultProps = {
    type: 'Circle',
    color: '#fff',
    size: 45
  }
  render () {
    return (
      <BlurView opacity={this.props.backgroundOpacity} fadeIn containerStyle={{justifyContent: 'center', alignItems: 'center'}}>
        <Spinner {...this.props} />
      </BlurView>
    )
  }
}
