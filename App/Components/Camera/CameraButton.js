import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const CameraButton = (props) => {
  const {onPress, icon, buttonColor} = props
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
          size={100}
          style={{color: buttonColor}}
        />
      </View>
    </TouchableOpacity>
  )
}

export default CameraButton

const styles = {
  iconContainer: {
    flex: 1
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 10,
    alignSelf: 'center',
    margin: 20
  }
}
