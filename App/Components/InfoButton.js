import React, {Component} from 'react'

import NavBarButton from './NavBarButton'

export default class InfoButton extends Component {
  render () {
    const {onPress} = this.props

    return (
      <NavBarButton
        position='right'
        icon='ios-information-circle-outline'
        iconStyle={{color: 'white', size: 25}}
        onPress={() => onPress()} />
    )
  }
}
