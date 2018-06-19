import React, { Component } from 'react'
import { Image, View, ViewPropTypes, ActivityIndicator } from 'react-native'
import resolveAssetSource from 'resolveAssetSource'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {ImageCacheManager} from 'react-native-cached-image'

import Log from '../Utils/Log'
const log = new Log('Components/ResponsiveImage')

export default class ResponsiveImage extends Component {
  static defaultProps = { scale: 1 }
  static propTypes = {
    source: Image.propTypes.source.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    imageStyle: ViewPropTypes.style,
    activeImageStyle: ViewPropTypes.style,
    scale: PropTypes.number,
    onDimensionsChanged: PropTypes.func,
    // Tries to cache remote files if this flag is set. Ignored for local files.
    cached: PropTypes.bool,
    activityIndicatorProps: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      height: 0,
      width: 0,
      isCacheable: true,
      cachedImagePath: null
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
    const {source, cached} = this.props
    // get size of network image
    if (source.uri) {
      if (cached) {
        this.processSourceCaching(source)
      } else {
        Image.getSize(source.uri, (width, height) => {
          this.updateDimensions(width, height)
        })
      }
    // get size of static images
    } else {
      const {width, height} = resolveAssetSource(source)
      this.updateDimensions(width, height)
    }
  }

  processSourceCaching (source) {
    const url = _.get(source, ['uri'], null)
    const imageCacheManager = this.getImageCacheManager()

    imageCacheManager.downloadAndCacheUrl(url)
      .then(cachedImagePath => {
        this.setState({
          cachedImagePath
        })
        Image.getSize('file://' + cachedImagePath, (width, height) => {
          this.updateDimensions(width, height)
        })
      })
      .catch((err) => {
        log.warn(err)
        this.setState({
          cachedImagePath: null,
          isCacheable: false
        })
      })
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.cached && !_.isEqual(this.props.source, nextProps.source)) {
      // if a new source is passed, process & cache it
      this.processSource(nextProps.source)
    }
  }

  getImageCacheManager () {
    // try to get ImageCacheManager from context
    if (this.context && this.context.getImageCacheManager) {
      return this.context.getImageCacheManager()
    }
    return ImageCacheManager()
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

  renderImage (source) {
    // If no width and no height had been specified, use layout hack (see: https://github.com/facebook/react-native/issues/950#issuecomment-380490025)
    // which uses full width of parent container. This should work like "width: 100% height: auto" in CSS
    if (!this.props.width && !this.props.height) {
      return (
        <View
          style={{flex: 1, flexDirection: 'row'}}>
          <Image resizeMode='contain'
            style={{
              flex: 1,
              width: null,
              height: null,
              aspectRatio: this.state.width / this.state.height}}
            source={source}
          />
        </View>
      )
    } else {
      return (
        <Image resizeMode='contain' source={source} style={[this.props.imageStyle, (this.state.height && this.state.width) ? {height: this.state.height * this.props.scale, width: this.state.width * this.props.scale} : null, this.props.activeImageStyle]} />
      )
    }
  }

  render () {
    const {cached} = this.props
    if (!cached || !this.props.source.uri) return this.renderImage(this.props.source)
    else {
      if (this.state.isCacheable && !this.state.cachedImagePath) {
        return this.renderLoader()
      }
      // Fallback, if source isn't cachable, use the source given in props
      const source = (this.state.isCacheable && this.state.cachedImagePath) ? {
        uri: 'file://' + this.state.cachedImagePath
      } : this.props.source
      return this.renderImage(source)
    }
  }

  renderLoader () {
    const {activityIndicatorProps} = this.props
    return (
      <ActivityIndicator
        {...activityIndicatorProps}
      />
    )
  }
}
