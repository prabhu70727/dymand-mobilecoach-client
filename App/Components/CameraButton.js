// This button is only for debugging porpuse and can be applied to PMNavigationBar rightButton-Prop inside of Chat.js

import React from 'react'
import NavBarButton from './NavBarButton'

const CameraButton = (props) => {
  return (
    <NavBarButton
      position='left'
      onPress={props.onPress}
      icon='ios-camera'
      containerStyle={styles.containerStyle}
      />
  )
}

const styles = {
  containerStyle: {
    position: 'absolute',
    right: 35,
    top: 0
  }
}

export default CameraButton
