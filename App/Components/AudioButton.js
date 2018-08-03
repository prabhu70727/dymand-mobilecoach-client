// This button is only for debugging porpuse and can be applied to PMNavigationBar rightButton-Prop inside of Chat.js

import React from 'react'
import NavBarButton from './NavBarButton'

const AudioButton = (props) => {
  return (
    <NavBarButton
      position='left'
      onPress={props.onPress}
      icon='ios-mic'
      containerStyle={styles.containerStyle}
      />
  )
}

const styles = {
  containerStyle: {
    position: 'absolute',
    right: 65,
    top: 0
  }
}

export default AudioButton
