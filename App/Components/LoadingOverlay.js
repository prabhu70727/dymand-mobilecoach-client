import React, {Component} from 'react'
import Spinner from 'react-native-spinkit'

import BlurView from './BlurView'

export default class LoadingOverlay extends Component {
  render () {
    const spinnerProps = {
      type: 'Circle',
      color: '#fff',
      isVisible: true,
      size: 60
    }
    return (
      <BlurView fadeIn containerStyle={{justifyContent: 'center', alignItems: 'center'}}>
        <Spinner {...spinnerProps} />
      </BlurView>
    )
  }
}
