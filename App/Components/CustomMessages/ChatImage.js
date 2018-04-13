import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { CachedImage } from 'react-native-cached-image'
import PropTypes from 'prop-types'
import ResponsiveImage from '../ResponsiveImage'
import {Metrics} from '../../Themes/'

export default class ChatImage extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    showModal: PropTypes.func.isRequired
  }
  renderImage (image) {
    // TODO: Would be nice if we didn't need to compute the image width this way..
    let imageWidth = Metrics.screenWidth - 135
    return (
      <ResponsiveImage ref={'cachedImage'} imageStyle={styles.image} activeImageStyle={image.style} source={image.source} width={imageWidth} />
    )
  }

  render () {
    return (
      <TouchableOpacity
        onPress={() => this.props.showModal('image-lightbox', {source: {uri: this.props.source}}
        )}
      >
        <CachedImage
          renderImage={(image) => this.renderImage(image)}
          activityIndicatorProps={{style: {width: 120, height: 60}}}
          source={{uri: this.props.source}}
        />
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 13,
    margin: 5
  }
})
