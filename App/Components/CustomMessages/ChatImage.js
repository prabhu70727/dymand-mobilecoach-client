import React, { Component } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import ResponsiveImage from '../ResponsiveImage'
import {Metrics, Colors} from '../../Themes/'

export default class ChatImage extends Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    showModal: PropTypes.func.isRequired
  }

  render () {
    // TODO: Would be nice if we didn't need to compute the image width this way..
    let imageWidth = Metrics.screenWidth - 135
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => this.props.showModal('image-lightbox', {source: {uri: this.props.source}}
        )}
      >
        <ResponsiveImage
          cached
          activityIndicatorProps={{color: Colors.messageBubbles.activityIndicator}}
          imageStyle={styles.image}
          // url-suffix parameters: /width/height/boolean watermark/boolean crop
          source={{uri: this.props.source + '/500/500/false/false'}}
          width={imageWidth}
        />
      </TouchableOpacity>
    )
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
