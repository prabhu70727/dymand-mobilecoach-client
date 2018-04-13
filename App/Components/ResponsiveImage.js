import React, { Component } from 'react'
import { Image, ViewPropTypes } from 'react-native'
import resolveAssetSource from 'resolveAssetSource'
import PropTypes from 'prop-types'

export default class ResponsiveImage extends Component {
  static defaultProps = { scale: 1 }
  static propTypes = {
    source: Image.propTypes.source.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    imageStyle: ViewPropTypes.style,
    activeImageStyle: ViewPropTypes.style,
    scale: PropTypes.number,
    onDimensionsChanged: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      height: 0,
      width: 0
    }
  }

  // Chek for dimension-Changes to notify callbacks
  componentWillUpdate (nextProps, nextState) {
    if (nextState !== this.state || nextProps.scale !== this.props.scale) {
      this.onDimensionsChangedCallback(nextState.width * nextProps.scale, nextState.height * nextProps.scale)
    }
  }

  onDimensionsChangedCallback (width, height) {
    if (this.props.onDimensionsChanged) {
      this.props.onDimensionsChanged(width, height)
    }
  }

  getDimensions () {
    return {
      width: this.state.width,
      height: this.state.height
    }
  }

  componentWillMount () {
    // get size of network image
    if (this.props.source.uri) {
      Image.getSize(this.props.source.uri, (width, height) => {
        this.updateDimensions(width, height)
      })
    // get size of static images
    } else {
      const {width, height} = resolveAssetSource(this.props.source)
      this.updateDimensions(width, height)
    }
  }

  updateDimensions (width, height) {
    if (this.props.width && !this.props.height) {
      this.setState({width: this.props.width, height: height * (this.props.width / width)})
      this.onDimensionsChangedCallback(this.props.width, height * (this.props.width / width))
    } else if (!this.props.width && this.props.height) {
      this.setState({width: width * (this.props.height / height), height: this.props.height})
      this.onDimensionsChangedCallback(width * (this.props.height / height), this.props.height)
    } else {
      this.setState({width: width, height: height})
      this.onDimensionsChangedCallback(width, height)
    }
  }

  render () {
    return (
      <Image resizeMode='contain' source={this.props.source} style={[this.props.imageStyle, (this.state.height && this.state.width) ? {height: this.state.height * this.props.scale, width: this.state.width * this.props.scale} : null, this.props.activeImageStyle]} />
    )
  }
}
