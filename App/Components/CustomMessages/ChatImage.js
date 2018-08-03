import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import urlapi from 'url'

import ResponsiveImage from '../ResponsiveImage'
import {Metrics, Colors} from '../../Themes/'
import AppConfig from '../../Config/AppConfig'
import {inputMessageStyles} from './Styles/CommonStyles'

export default class ChatImage extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    showModal: PropTypes.func.isRequired,
    position: PropTypes.string.isRequired
  }

  render () {
    // TODO: Would be nice if we didn't need to compute the image width this way..
    const {source, position} = this.props
    let imageWidth = Metrics.screenWidth - 135
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => this.props.showModal('image-lightbox', {source: {uri: this.props.source}}
        )}
      >
        <ResponsiveImage
          cached
          activityIndicatorColor={Colors.messageBubbles[position].activityIndicator}
          imageStyle={inputMessageStyles.mediaContent}
          source={{uri: this.getSourcePath(source)}}
          width={imageWidth}
        />
      </TouchableOpacity>
    )
  }

  getSourcePath (source) {
    // Use thumbnail service for images from own servers
    const { useLocalServer, localMediaURL, remoteMediaURL } = AppConfig.config.serverSync

    const hostname = urlapi.parse(useLocalServer ? localMediaURL : remoteMediaURL).hostname

    if (source.includes(hostname + '/')) {
      return source + '/500/500/false/false'
    } else return source
  }
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 13,
    margin: 5
  },
  imageContainer: {
    minWidth: 160,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
