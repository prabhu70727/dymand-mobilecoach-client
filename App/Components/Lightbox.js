
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  View,
  Text
} from 'react-native'
import * as Animatable from 'react-native-animatable'
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

export default class Lightbox extends Component {
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
      initialZoom: 1,
      initialDistance: null,
      topAnimated: null,
      leftAnimated: null,
      zoomAnimated: new Animated.Value(1)
    }
    this.imageWidth = 0
    this.imageHeight = 0
    this.state.zoomAnimated.addListener(({value}) => { this._value = value })
    // Pand responders for Container (swipe to close funtionality)
    this.containerPan = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!this.initialized) return false
        if (Platform.OS === 'android' && Math.abs(gestureState.dx) < 2) return false
        // Only care for gestures when not animating / zooming
        if (this.isAnimating || this.isZooming || this.state.zoomAnimated._value !== 1) return false
        else {
          let touches = evt.nativeEvent.touches
          // for this responder, only care for 1-Finger-gestures and the lightbox isn't currently zoomed
          if (touches.length > 1 && this.state.zoomAnimated._value === 1) return false
        }
        return true
      },
      onPanResponderMove: (evt, gestureState) => {
        const {dy} = gestureState
        // Update Position and opacity accoring to current gesture-position
        this.state.topAnimated.setValue(this.previousTop + dy)
        this.state.opacityAnimated.setValue(1 - (Math.abs(dy) / Metrics.screenHeight) * 2)
        this.state.zoomAnimated.setValue(1 - (Math.abs(dy) / Metrics.screenHeight) * 0.5)
      },
      onPanResponderRelease: (evt, gestureState) => this.handlePanResponderEnd(evt, gestureState)
    })

    // Pand responders for Image-Container (Pinch to Zoom funtionality)
    this.imagePan = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!this.initialized) return false
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
        if (this.state.zoomAnimated._value < 1) this.rebounce()
        else this.bounceToBounds()
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
      this.imageWidth = width
      this.imageHeight = height
      this.setState({
        initialZoom: 1,
        initialDistance: 0,
        topAnimated: new Animated.Value(top),
        leftAnimated: new Animated.Value(left),
        zoomAnimated: new Animated.Value(1),
        opacityAnimated: new Animated.Value(1)
      })
      this.initialized = true
    }
  }

  currentImageWidth () {
    return this.imageWidth * this.state.zoomAnimated._value
  }

  currentImageHeight () {
    return this.imageHeight * this.state.zoomAnimated._value
  }

  getMaxLeft () {
    return (this.currentImageWidth() - this.imageWidth) / 2 + BOUNDS_PADDING
  }

  getMinLeft () {
    return Metrics.screenWidth - this.currentImageWidth() + ((this.currentImageWidth() - this.imageWidth) / 2) - BOUNDS_PADDING
  }

  getMaxTop () {
    return (this.currentImageHeight() - this.imageHeight) / 2 + BOUNDS_PADDING
  }

  getMinTop () {
    return Metrics.screenHeight - this.currentImageHeight() + ((this.currentImageHeight() - this.imageHeight) / 2) - BOUNDS_PADDING
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
    if (this.state.zoomAnimated._value !== 1) this.rebounce()
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

    // Care that the Image stays in View..
    if (newTop > this.getMaxTop()) newTop = this.getMaxTop()
    if (newTop < this.getMinTop()) newTop = this.getMinTop()

    if (newLeft > this.getMaxLeft()) newLeft = this.getMaxLeft()
    if (newLeft < this.getMinLeft()) newLeft = this.getMinLeft()

    // Only allow drag if the image overflows the related axis! (No drag if the axis is completely visible..)
    if (Metrics.screenHeight > this.currentImageHeight()) newTop = this.previousTop
    if (Metrics.screenWidth > this.currentImageWidth()) newLeft = this.previousLeft

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
        initialZoom: this.state.zoomAnimated._value
      })
    // if this is not the initial pinch-event, set the zoom
    } else {
      let touchZoom = distance / this.state.initialDistance
      let zoom = touchZoom * this.state.initialZoom
      if (zoom > this.props.maxZoom) zoom = this.props.maxZoom
      if (zoom < this.props.minZoom) zoom = this.props.minZoom
      // Update Zoom
      this.state.zoomAnimated.setValue(zoom)
    }
  }

  // this function Animates the Image back into boundries
  // This might be nessecary if the user zoomes out and previously moved the zoomed image
  bounceToBounds () {
    let top = this.previousTop
    let left = this.previousLeft
    // Check if the position is out of bounds
    if (top > this.getMaxTop()) top = this.getMaxTop()
    if (top < this.getMinTop()) top = this.getMinTop()
    if (Metrics.screenHeight > this.currentImageHeight()) top = this.initTop

    if (left > this.getMaxLeft()) left = this.getMaxLeft()
    if (left < this.getMinLeft()) left = this.getMinLeft()
    if (Metrics.screenWidth > this.currentImageWidth()) left = this.initLeft

    // If one of the values exeeds the boundries, bounce back
    if (top !== this.previousTop || left !== this.previousLeft) {
      this.isAnimating = true
      Animated.parallel([
        Animated.timing(
          this.state.topAnimated,
          {
            toValue: top,
            duration: REBOUNCE_DURATION
          }
        ),
        Animated.timing(
          this.state.leftAnimated,
          {
            toValue: left,
            duration: REBOUNCE_DURATION
          }
        )
      ]).start(() => {
        this.isAnimating = false
        this.previousTop = this.state.topAnimated._value
        this.previousLeft = this.state.leftAnimated._value
      })
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
          <Animatable.View useNativeDriver ref={container => { this.imgContainer = container }}
            {...this.imagePan.panHandlers}
            style={{
              justifyContent: 'center',
              position: 'absolute',
              transform: [
                {translateY: this.state.topAnimated ? this.state.topAnimated : 0},
                {translateX: this.state.leftAnimated ? this.state.leftAnimated : 0},
                {scaleX: this.state.zoomAnimated},
                {scaleY: this.state.zoomAnimated}
              ]
            }} // top: this.state.topAnimated, left: this.state.leftAnimated
            >
            <TouchableOpacity activeOpacity={1} onPress={() => this.handleTap()}>
              <ResponsiveImage
                cached
                // the Lightbox has it's own activity-Indicator, so we dont want
                // the indicator from responsive-image to be displayed as well
                activityIndicatorColor='transparent'
                ref={img => { this.img = img }}
                source={source}
                width={INIT_IMAGE_WIDTH}
                onDimensionsChanged={(width, height) => {
                  if (!this.initialized) this.initialize(width, height)
                }}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => this.closeLightbox()}>
          <Text style={styles.closeButton}>{I18n.t('Common.close')}</Text>
          <Icon name='md-close' type='ionicon' style={{paddingLeft: 10, fontSize: 30, color: '#fff'}} />
        </TouchableOpacity>
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
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  closeButton: {
    fontSize: 20,
    color: '#fff'
  }
})
