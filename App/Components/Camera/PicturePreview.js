import React from 'react'
import {
  View,
  Image,
  TouchableWithoutFeedback
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import HeaderBar from './../HeaderBar'

const PicturePreview = (props) => {
  const {onConfirm, onAbort, onBack, imageSource, title} = props
  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <HeaderBar
        title={title}
        onBack={onBack}
        />
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
        <Image
          style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}
          source={{uri: imageSource}}
          resizeMode='cover'
        />
      </View>

      <View style={{flexDirection: 'row', position: 'absolute', bottom: 0, right: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 10}}>
        <TouchableWithoutFeedback onPress={onAbort}>
          <View style={{paddingHorizontal: 25}}>
            <Icon
              name={'cancel'}
              size={60}
              style={{color: 'rgb(255,109,71)'}}
            />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onConfirm}>
          <View style={{paddingHorizontal: 25}}>
            <Icon
              name={'check-circle'}
              size={60}
              style={{color: 'rgb(60, 255, 118)'}}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}

export default PicturePreview
