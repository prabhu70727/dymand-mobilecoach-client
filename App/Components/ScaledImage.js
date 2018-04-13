import React, { Component } from 'react'
import { Image } from 'react-native'
import resolveAssetSource from 'resolveAssetSource'
import PropTypes from 'prop-types'

export default class ScaledImage extends Component {
  constructor (props) {
    super(props)
    this.scaleFactor = null
  }

  componentWillMount () {
    let source = resolveAssetSource(this.props.source)
    const {width, height} = source
    if (this.props.width && !this.props.height) {
      this.setState({width: this.props.width, height: height * (this.props.width / width)})
      if (this.props.setScaleFactor) this.props.setScaleFactor(this.props.width / width)
    } else if (!this.props.width && this.props.height) {
      this.setState({width: width * (this.props.height / height), height: this.props.height})
      if (this.props.setScaleFactor) this.props.setScaleFactor(this.props.height / height)
    } else {
      this.setState({width: width, height: height})
    }
  }

  getScaleFactor () {
    return this.scaleFactor
  }

  render () {
    return (
      <Image source={this.props.source} style={[this.props.style, {height: this.state.height, width: this.state.width}]} />
    )
  }
}

ScaledImage.propTypes = {
  source: Image.propTypes.source.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
  setScaleFactor: PropTypes.func
}
