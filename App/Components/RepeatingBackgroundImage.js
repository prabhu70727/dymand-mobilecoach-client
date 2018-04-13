import React, {Component} from 'react'
import {ImageBackground, Image, Platform, View} from 'react-native'
import { Metrics } from '../Themes/'

export default class RepeatingBackgroundImage extends Component {
  static propTypes = {
    source: Image.propTypes.source
  }

  constructor (props) {
    super(props)
    // Unfortunatley, resizeMode repeat is only available for ios, so we need to use a hacky solution for Android
    // calculate the image-Matrix in constructor so it doesn't need to be recalculated on every render
    if (Platform.OS === 'android') {
      const {source} = this.props
      const {width, height} = Image.resolveAssetSource(source)

      this.imageMatrix = []
      for (let j = 0; j < Math.ceil(Metrics.screenHeight / width); j++) {
        let imageRow = []
        for (let i = 0; i < Math.ceil(Metrics.screenWidth / height); i++) {
          imageRow.push((
            <Image
              key={i}
              style={{width: width, height: height}}
              source={source}
            />
          ))
        }
        this.imageMatrix.push(
          <View key={j} style={{flex: 1, flexDirection: 'row', position: 'absolute', top: j * height}}>
            {
             imageRow.map((img, i) => {
               return img
             })
            }
          </View>
        )
      }
    }
  }

  render () {
    const {source} = this.props
    if (source) {
      if (Platform.OS === 'ios') {
        return (
          <ImageBackground
            resizeMode='repeat'
            source={source}
            style={{flex: 1}}>
            {this.props.children}
          </ImageBackground>
        )
      } else {
        return (
          <View style={{flex: 1, flexDirection: 'column'}}>
            {
             this.imageMatrix.map((imgRow, i) => {
               return imgRow
             })
            }
            <View style={{
              flex: 1,
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }}>
              {this.props.children}
            </View>
          </View>
        )
      }
    } else {
      return (
        <View style={{
          flex: 1,
          position: 'absolute',
          backgroundColor: 'transparent',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}>
          {this.props.children}
        </View>
      )
    }
  }
}
