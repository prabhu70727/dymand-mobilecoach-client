import React, { Component } from 'react'
import {
  View,
  TouchableWithoutFeedback
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Video from 'react-native-video'

import HeaderBar from './../HeaderBar'

export default class VideoPreview extends Component {
  constructor (props) {
    super(props)
    this.initialState = {}

    this.state = this.initialState
  }

  render () {
    const {title, onAbort, onBack, onConfirm, source} = this.props
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <HeaderBar
          title={title}
          onBack={onBack}
        />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <Video
            style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}
            source={{uri: source}}
            ref={ref => {
              this.player = ref
            }}
            resizeMode='cover'
            repeat
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
}
