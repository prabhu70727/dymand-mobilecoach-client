import React, { Component } from 'react'
import { Image, View, ViewPropTypes, ActivityIndicator } from 'react-native'
import resolveAssetSource from 'resolveAssetSource'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Common from '../Utils/Common'

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
    activityIndicatorColor: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      height: 0,
      width: 0,
      isCacheable: true,
      cachedImagePath: null,
      imageLoaded: false
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
      if (cached && source.uri.startsWith('http')) {
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
    const imageCacheManager = Common.getImageCacheManager()
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
            onLoad={() => this.setState({imageLoaded: true})}
          />
        </View>
      )
    } else {
      return (
        <Image onLoad={() => this.setState({imageLoaded: true})} resizeMode='contain' source={source} style={[this.props.imageStyle, (this.state.height && this.state.width) ? {height: this.state.height * this.props.scale, width: this.state.width * this.props.scale} : null, this.props.activeImageStyle]} />
      )
    }
  }

  renderContent () {
    const {cached} = this.props
    // Just render Image immediately for the following cases:
    // 1. 'cached' flag is set to false
    // 2. source doesn't have an 'uri' prop => image-asset source already, no url given (e.g. required static image source)
    // 3. source has a uri, but doesn't start with 'http' => local file uri!
    if (!cached || !this.props.source.uri || !this.props.source.uri.startsWith('http')) return this.renderImage(this.props.source)
    // ...else, if image source is remove source:
    else {
      // check if source is cachable
      if (this.state.isCacheable) {
        // ...if cachable, but there is no cachedImagePath, just show loader
        if (!this.state.cachedImagePath || this.state.cachedImagePath === null) {
          return null
        // else use cachedImagePath...
        } else {
          const source = { uri: 'file://' + this.state.cachedImagePath }
          return this.renderImage(source)
        }
      // Fallback, if source isn't cachable, use the source given in props
      } else {
        const {source} = this.props
        return this.renderImage(source)
      }
    }
  }

  render () {
    const {activityIndicatorColor} = this.props
    return (
      <View>
        {this.renderContent()}
        {!this.state.imageLoaded
          ? <ActivityIndicator
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            color={activityIndicatorColor}
          /> : null
        }
      </View>
    )
  }
}
