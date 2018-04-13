
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  View
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import Button from 'react-native-button'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'
import I18n from '../I18n/I18n'

import ResponsiveImage from './ResponsiveImage'
import { Metrics } from '../Themes/'

const REBOUNCE_DURATION = 100
const INIT_IMAGE_WIDTH = Metrics.screenWidth - 40
const BOUNDS_PADDING = 20

function calcDistance (x1, y1, x2, y2) {
  let dx = Math.abs(x1 - x2)
  let dy = Math.abs(y1 - y2)
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
}

function getMaxTop (currentImgHeight) {
  if (currentImgHeight === Metrics.screenHeight) return 0 - BOUNDS_PADDING
  if (currentImgHeight > Metrics.screenHeight) return Metrics.screenHeight - currentImgHeight - BOUNDS_PADDING
  else return 0
}

function getMinTop (currentImgHeight) {
  if (currentImgHeight === Metrics.screenHeight) return 0 + BOUNDS_PADDING
  if (currentImgHeight > Metrics.screenHeight) return 0 + BOUNDS_PADDING
  else return Metrics.screenHeight - currentImgHeight
}

function getMaxLeft (currentImgWidt) {
  if (currentImgWidt === Metrics.screenWidth) return 0 - BOUNDS_PADDING
  if (currentImgWidt > Metrics.screenWidth) return Metrics.screenWidth - currentImgWidt - BOUNDS_PADDING
  else return 0
}

function getMinLeft (currentImgWidt) {
  if (currentImgWidt === Metrics.screenWidth) return 0 + BOUNDS_PADDING
  if (currentImgWidt > Metrics.screenWidth) return 0 + BOUNDS_PADDING
  else return Metrics.screenWidth - currentImgWidt
}

class Lightbox extends Component {
  static defaultProps = {
    minZoom: 0.7,
    maxZoom: 4
  }

  static propTypes = {
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.state = {
      zoom: 1,
      currentImgWidth: 0,
      currentImgHeight: 0,
      initialZoom: 1,
      initialDistance: null,
      topAnimated: null,
      leftAnimated: null,
      zoomAnimated: new Animated.Value(1)
    }
    // Pand responders for Container (swipe to close funtionality)
    this.containerPan = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (Platform.OS === 'android' && Math.abs(gestureState.dx) < 2) return false
        // Only care for gestures when not animating / zooming
        if (this.isAnimating || this.isZooming || this.state.zoom !== 1) return false
        else {
          let touches = evt.nativeEvent.touches
          // for this responder, only care for 1-Finger-gestures and the lightbox isn't currently zoomed
          if (touches.length > 1 && this.state.zoom === 1) return false
        }
        return true
      },
      onPanResponderMove: (evt, gestureState) => {
        const {dy} = gestureState
        // Update Position and opacity accoring to current gesture-position
        this.state.topAnimated.setValue(this.previousTop + dy)
        this.state.opacityAnimated.setValue(1 - (Math.abs(dy) / Metrics.screenHeight) * 2)
        this.state.zoomAnimated.setValue(1 - (Math.abs(dy) / Metrics.screenHeight) * 0.5)
        this.state.leftAnimated.setValue(this.initLeft - this.getLeftOffset())
      },
      onPanResponderRelease: (evt, gestureState) => this.handlePanResponderEnd(evt, gestureState)
    })

    // Pand responders for Image-Container (Pinch to Zoom funtionality)
    this.imagePan = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (Platform.OS === 'android' && Math.abs(gestureState.dx) < 2) return false
        let touches = evt.nativeEvent.touches
        // for this responder, only care for 2-Finger-gestures (pinch)
        if (touches.length === 2) return true
        if (touches.length === 1) return true
        return false
      },
      onPanResponderMove: (evt, gestureState) => {
        let touches = evt.nativeEvent.touches
        if (touches.length === 2 && touches[0] && touches[1]) this.handlePinch(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY)
        else if (!this.isZooming) {
          const {dx, dy} = gestureState
          this.handleDrag(dx, dy)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.isZooming = false
        this.isMoving = false
        this.previousTop = this.state.topAnimated._value
        this.previousLeft = this.state.leftAnimated._value
        // Don't allow negative zooms, if zoom < 1, bounce-back
        if (this.state.zoom < 1) this.rebounce()
      }
    })
    // Variables to save current states
    this.isAnimating = false
    this.isZooming = false
    this.isMoving = false
    this.initialized = false
  }

  initialize (width, height) {
    if (width !== 0 && height !== 0) {
      let top = (Metrics.screenHeight - height) / 2
      let left = (Metrics.screenWidth - width) / 2
      this.initTop = top
      this.initLeft = left
      this.previousTop = top
      this.previousLeft = left
      this.setState({
        zoom: 1,
        currentImgWidth: width,
        currentImgHeight: height,
        initialZoom: 1,
        initialDistance: 0,
        topAnimated: new Animated.Value(top),
        leftAnimated: new Animated.Value(left),
        zoomAnimated: new Animated.Value(1),
        opacityAnimated: new Animated.Value(1)
      }, () => {
        // We need to update zoom as well, cause we pass it as a prop to responsive-image.
        // We can't use animeted._value because this wouldn't nofitfy child of value-changes.
        this.state.zoomAnimated.addListener(({value}) => {
          this.setState({zoom: value})
        })
      })
      this.initialized = true
    }
  }

  // To keep the Image centered while zooming, the offsets caused by
  // the zoom-factor need to be calculated
  getTopOffset (newZoom) {
    const {height} = this.img.getDimensions()
    let initialZoom = this.state.initialZoom
    let zoom = this.state.zoom
    if (newZoom) zoom = newZoom
    let initialOffset = (height * initialZoom - height) / 2
    let newOffset = (height * zoom - height) / 2
    return newOffset - initialOffset
  }

  getLeftOffset (newZoom) {
    const {width} = this.img.getDimensions()
    let initialZoom = this.state.initialZoom
    let zoom = this.state.zoom
    if (newZoom) zoom = newZoom
    let initialOffset = (width * initialZoom - width) / 2
    let newOffset = (width * zoom - width) / 2
    return newOffset - initialOffset
  }

  handlePanResponderEnd (evt, gestureState) {
    const {dy} = gestureState
    // If moved high enough
    if (-dy > 0.25 * Metrics.screenHeight) {
      // ..close modal
      this.closeLightbox('up')
    // or low enough..
    } else if (dy > 0.25 * Metrics.screenHeight) {
      this.closeLightbox('down')
    } else {
      this.rebounce()
    }
  }

  handleTap () {
    if (this.state.zoom !== 1) this.rebounce()
    else this.closeLightbox()
  }

  closeLightbox (direction) {
    let animations = [this.mask.fadeOut(350)]
    if (direction === 'up' || direction === 'down') {
      this.props.onClose()
    }
    if (typeof direction === 'undefined') {
      animations.push(this.imgContainer.fadeOut(350))
      Promise.all(animations).then(() => { this.props.onClose() })
    }
  }

  handleDrag (dx, dy) {
    let newTop = this.previousTop + dy
    let newLeft = this.previousLeft + dx
    if (newTop < getMaxTop(this.state.currentImgHeight)) newTop = getMaxTop(this.state.currentImgHeight)
    else if (newTop > getMinTop(this.state.currentImgHeight)) newTop = getMinTop(this.state.currentImgHeight)
    if (newLeft < getMaxLeft(this.state.currentImgWidth)) newLeft = getMaxLeft(this.state.currentImgWidth)
    else if (newLeft > getMinLeft(this.state.currentImgWidth)) newLeft = getMinLeft(this.state.currentImgWidth)

    this.state.topAnimated.setValue(newTop)
    this.state.leftAnimated.setValue(newLeft)
  }

  handlePinch (x1, y1, x2, y2) {
    let distance = calcDistance(x1, y1, x2, y2)
    // Store values of initial pinch gesture, to be able to calc relative values
    if (!this.isZooming) {
      this.isZooming = true
      this.setState({
        initialDistance: distance,
        initialZoom: this.state.zoom
      })
    // if this is not the initial pinch-event, set the zoom
    } else {
      let touchZoom = distance / this.state.initialDistance
      let zoom = touchZoom * this.state.initialZoom
      if (zoom > this.props.maxZoom) zoom = this.props.maxZoom
      if (zoom < this.props.minZoom) zoom = this.props.minZoom
      // Update Zoom
      this.state.zoomAnimated.setValue(zoom)
      this.state.leftAnimated.setValue(this.previousLeft - this.getLeftOffset(zoom))
      this.state.topAnimated.setValue(this.previousTop - this.getTopOffset(zoom))
    }
  }

  rebounce () {
    this.isAnimating = true
    Animated.parallel([
      Animated.timing(
        this.state.topAnimated,
        {
          toValue: this.initTop,
          duration: REBOUNCE_DURATION
        }
      ),
      Animated.timing(
        this.state.leftAnimated,
        {
          toValue: this.initLeft,
          duration: REBOUNCE_DURATION
        }
      ),
      Animated.timing(
        this.state.opacityAnimated,
        {
          toValue: 1,
          duration: REBOUNCE_DURATION
        }
      ),
      Animated.timing(
        this.state.zoomAnimated,
        {
          toValue: 1,
          duration: REBOUNCE_DURATION
        }
      )
    ]).start(() => {
      this.resetValues()
    })
  }

  resetValues () {
    this.isAnimating = false
    this.previousTop = this.initTop
    this.previousLeft = this.initLeft
    this.setState({initialZoom: 1, initialDistance: 0})
  }

  render () {
    const { source } = this.props
    return (
      <Animatable.View useNativeDriver style={[styles.mask, {opacity: this.state.opacityAnimated}]} ref={mask => { this.mask = mask }}>
        {!this.initialized ? <ActivityIndicator size='large' color='#fff' /> : null}
        <View {...this.containerPan.panHandlers} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
          <Animatable.View ref={container => { this.imgContainer = container }}
            {...this.imagePan.panHandlers}
            style={{position: 'absolute', top: this.state.topAnimated, left: this.state.leftAnimated, width: this.state.currentImgWidth, height: this.state.currentImgHeight}}
            >
            <TouchableOpacity activeOpacity={1} onPress={() => this.handleTap()}>
              <ResponsiveImage
                ref={img => { this.img = img }}
                source={source} width={INIT_IMAGE_WIDTH}
                onDimensionsChanged={(width, height) => {
                  this.setState({currentImgWidth: width, currentImgHeight: height})
                  if (!this.initialized) this.initialize(width, height)
                }}
                scale={this.state.zoom}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
        <Button
          containerStyle={styles.closeButtonContainer}
          style={styles.closeButton}
          onPress={() => this.closeLightbox()}>
          {I18n.t('Common.close')}
          <Icon name='md-close' type='ionicon' style={{paddingLeft: 10, fontSize: 30, color: '#fff'}} />
        </Button>
      </Animatable.View>
    )
  }
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    ...ifIphoneX({
      top: 55
    })
  },
  closeButton: {
    color: '#fff'
  }
})

export { Lightbox }
