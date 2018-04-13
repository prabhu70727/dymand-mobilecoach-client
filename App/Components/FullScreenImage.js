import React, { Component } from 'react'
import { Image } from 'react-native'
import PropTypes from 'prop-types'

class FullScreenImage extends Component {
  render () {
    const {source, children, style, ...props} = this.props
    return (
      <Image source={source}
        style={{ flex: 1, width: null, height: null, ...style }}
        {...props}>
        { children }
      </Image>
    )
  }
}
FullScreenImage.propTypes = {
  source: Image.propTypes.source.isRequired,
  children: PropTypes.object,
  style: PropTypes.object
}
export default FullScreenImage
