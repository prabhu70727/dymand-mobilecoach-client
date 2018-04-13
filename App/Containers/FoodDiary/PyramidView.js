import React, {Component} from 'react'
import {View, ScrollView, StyleSheet, Text, Animated} from 'react-native'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
// import R from 'ramda'
import { Dropdown } from 'react-native-material-dropdown'
// import * as Animatable from 'react-native-animatable'
// import moment from 'moment'
import Button from 'react-native-button'
import moment from 'moment'
import I18n from '../../I18n/I18n'

import {PyramidStages, computeStagePercentage} from '../AddMealModule/FoodMetrics'
import {Colors, Metrics, Images} from '../../Themes/'
import ScaledImage from '../../Components/ScaledImage'

// 394 would be the original bar-height in the full sized pyramid image
const BASE_DIMENSIONS = {
  barHeight: 117,
  topHeight: 169,
  barMarginHeight: 6
}

class PyramidView extends Component {
  constructor (props) {
    super(props)
    const {foodDiary} = props
    const {trackingPeriods} = foodDiary
    // const {activeTrackingPeriod} = foodDiary
    // const {trackedDaysComplete} = trackingPeriods[activeTrackingPeriod]
    this.data = []
    trackingPeriods.forEach((trackingPeriod, i) => {
      const {completed} = trackingPeriod
      // only add completed tracking-Periods
      if (completed) {
        this.data.push({value: '' + i, label: I18n.t('FoodDiary.trackingPeriodNumber') + ' ' + (i + 1)})
      }
    })

    this.state = {
      selectedPeriod: '0'
    }
  }

  componentWillReceiveProps (nextProps) {
    const {trackingPeriods} = nextProps.foodDiary
    this.data = []
    trackingPeriods.forEach((trackingPeriod, i) => {
      const {completed} = trackingPeriod
      // only add completed tracking-Periods
      if (completed) {
        this.data.push({value: '' + i, label: I18n.t('FoodDiary.trackingPeriodNumber') + ' ' + (i + 1)})
      }
    })
  }

  render () {
    // only render pyramid, if the first period is completed
    const {foodDiary} = this.props
    if (foodDiary.trackingPeriods[0] && this.props.foodDiary.trackingPeriods[0].completed) return this.renderContent()
    else {
      return (
        <View style={styles.container}>
          <Text style={styles.missingDataText}>{I18n.t('FoodDiary.trackingPeriodIncompleteNotice')}</Text>
        </View>
      )
    }
  }

  renderContent () {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.selectionBar}>
          {this.renderDropDown()}
        </View>
        {this.renderPyramidContainer()}
      </ScrollView>
    )
  }

  renderDropDown () {
    return (
      <Dropdown
        label={I18n.t('FoodDiary.selectedRange')}
        data={this.data}
        value={this.data[0].value}
        onChangeText={(value, index, data) => this.onSelectionChanged(value, index, data)}
      />
    )
  }

  onSelectionChanged (value, index, data) {
    this.setState({
      selectedPeriod: value
    })
  }

  aggregateDays (trackingPeriod) {
    let meals = []
    trackingPeriod.meals.forEach(meal => {
      let mealDay = moment(meal.mealTime).format('DD.MM.YYYY')
      // check if mealday was on one of the completed days and push it to meals array
      if (trackingPeriod.trackedDaysComplete.includes(mealDay)) meals.push(meal)
    })
    return meals
  }

  onPressInfo () {
    const { showModal, infoText } = this.props
    showModal('rich-text', {htmlMarkup: infoText})
  }

  renderPyramidContainer () {
    const { trackingPeriods } = this.props.foodDiary
    const { selectedPeriod } = this.state
    // const {meals} = this.props.foodDiary.trackingPeriods[parseInt(this.state.selectedPeriod)]
    const meals = this.aggregateDays(trackingPeriods[selectedPeriod])
    // Amount of tracked Days, default = 1
    let includedDays = [...trackingPeriods[selectedPeriod].trackedDaysComplete].reverse()
    const dayCount = trackingPeriods[selectedPeriod].trackedDaysComplete.length
    return (
      <View>
        <Pyramid pyramidScale={1} horizontalPadding={20} meals={meals} dayCount={dayCount} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          disabledContainerStyle={styles.buttonDisabled}
          onPress={() => this.onPressInfo()}
          disabled={false}>
          Interpretationshilfe
        </Button>
        <Text style={styles.includingDaysTitle}>{I18n.t('FoodDiary.trackingPeriodNumber') + ' ' + (parseInt(selectedPeriod) + 1)}</Text>
        <View style={{padding: 20, paddingTop: 0}}>
          {includedDays.map((day, index) => {
            let dayNumber = index + 1
            let dayString = '• ' + I18n.t('FoodDiary.day') + ' ' + dayNumber + ': '
            // let circumstances = I18n.t('PDFExport.text1') + ': '
            // if (this.props.foodDiary.circumstances[day]) circumstances = I18n.t('FoodDiary.' + this.props.foodDiary.circumstances[day])
            // else circumstances = circumstances + I18n.t('FoodDiary.ordinary')
            return (
              <Text style={styles.includingDays} key={index}>
                <Text style={{fontWeight: 'bold'}}>{dayString}</Text>
                <Text>{day}</Text>
              </Text>
            )
          })}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    foodDiary: state.fooddiary
  }
}

export default connect(mapStateToProps)(PyramidView)

class Pyramid extends Component {
  state = {
    scaleFactor: 0,
    pyramidWidth: 0,
    pyramidContainerWidth: 0
  }

  setScaleFactor (scaleFactor) {
    this.setState({scaleFactor})
  }

  renderPyramid () {
    const {meals} = this.props
    const {dayCount} = this.props
    const {horizontalPadding} = this.props
    if (this.state.pyramidWidth > 0) {
      return (
        <View>
          <ScaledImage
            setScaleFactor={(factor) => { this.setScaleFactor(factor) }}
            source={Images.custom.pyramidBg}
            width={this.state.pyramidWidth}
          />
          {[...PyramidStages].reverse().map((stage, i) => {
            return (
              <View key={i} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
                <PyramidBar
                  meals={meals}
                  pyramidStage={stage}
                  pyramidContainerWidth={this.state.pyramidContainerWidth}
                  pyramidWidth={this.state.pyramidWidth}
                  scaleFactor={this.state.scaleFactor}
                  horizontalPadding={horizontalPadding}
                  dayCount={dayCount}
                />
              </View>
            )
          }
          )}
          <ScaledImage
            setScaleFactor={(factor) => { this.setScaleFactor(factor) }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0
            }}
            source={Images.custom.pyramidFood}
            width={this.state.pyramidWidth}
          />
        </View>
      )
    }
  }

  measureView (event) {
    const {horizontalPadding} = this.props
    this.setState(
      {
        pyramidWidth: (this.props.pyramidScale * event.nativeEvent.layout.width) - horizontalPadding * 2,
        pyramidContainerWidth: event.nativeEvent.layout.width - horizontalPadding * 2
      }
    )
  }

  render () {
    return (
      <View style={{flexDirection: 'row', marginTop: 20, overflow: 'hidden'}}>
        <View
          onLayout={(event) => this.measureView(event)}
          style={{
            flex: 1,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {this.renderPyramid()}
        </View>
      </View>
    )
  }
}

class PyramidBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      percentageAnimation: new Animated.Value(Metrics.screenWidth)
    }
    this.percentage = 0
  }

  setScaleFactor (scaleFactor) {
    this.setState({scaleFactor})
  }

  componentWillReceiveProps (nextProps) {
    const {scaleFactor, pyramidStage, meals, pyramidWidth, pyramidContainerWidth, dayCount} = nextProps
    let percentage = computeStagePercentage(meals, pyramidStage)
    if (dayCount > 0) this.percentage = percentage / dayCount
    // If there are no days, percentage = 0..
    else this.percentage = 0
    let stageWidth = pyramidStage.unscaledWidth * scaleFactor
    let barWidth = scaleFactor * pyramidStage.unscaledWidth
    let offset = pyramidContainerWidth - (pyramidWidth / 2) + (barWidth / 2)
    if (!isNaN(this.percentage)) {
      // (width / 2 + stageWidth / 2) = start point
      let newPosition = offset - (stageWidth / 100) * this.percentage
      Animated.timing(
        this.state.percentageAnimation,
        {
          toValue: newPosition,
          duration: 500
        }
      ).start()
    }
  }

  render () {
    const {scaleFactor, pyramidStage, pyramidWidth, pyramidContainerWidth} = this.props
    const position = 6 - pyramidStage.stage
    let barHeight = scaleFactor * BASE_DIMENSIONS.barHeight
    let barWidth = scaleFactor * pyramidStage.unscaledWidth
    let barMarginHeight = scaleFactor * BASE_DIMENSIONS.barMarginHeight
    // I have no idea why we need to subtract 1 from position...
    let scaledPositionTop = (position - 1) * (barHeight + barMarginHeight) + (scaleFactor * BASE_DIMENSIONS.topHeight + barMarginHeight)
    // Some corrections because top of the pyramid is higher..
    if (position === 0) {
      barHeight = scaleFactor * BASE_DIMENSIONS.topHeight
      scaledPositionTop = 0
    }
    // barHeight * 0.62 = Offset for the crooked edges
    let triangleOffset = barHeight * 0.62
    let scaledRightPosition = pyramidContainerWidth - (pyramidWidth / 2) + (barWidth / 2) - triangleOffset
    return (
      <View>
        <View style={{
          position: 'absolute',
          flex: 1,
          bottom: scaledPositionTop + barHeight,
          right: 0,
          top: scaledPositionTop,
          left: 0
        }}>
          <Animated.View style={{
            // Stage bar
            height: 0,
            borderBottomWidth: barHeight,
            borderBottomColor: pyramidStage.color,
            borderRightWidth: triangleOffset,
            borderRightColor: 'transparent',
            borderStyle: 'solid',
            position: 'absolute',
            left: -100,
            right: this.state.percentageAnimation,
            top: 0

          }}
          />
          <View style={{
            // stage-bar mask
            height: 0,
            borderTopWidth: barHeight + 1,
            borderTopColor: '#fff',
            borderRightWidth: triangleOffset,
            borderRightColor: 'transparent',
            borderStyle: 'solid',
            position: 'absolute',
            top: 0,
            right: scaledRightPosition,
            left: -100
          }}
          />
          {/*
            <View style={{
              position: 'absolute',
              borderColor: pyramidStage.color,
              backgroundColor: pyramidStage.color,
              borderBottomWidth: 3,
              justifyContent: 'flex-end',
              right: 20,
              height: barHeight
            }}>
              <Text style={{
                color: Colors.main.grey1,
                textAlign: 'center'
              }}>
                {parseFloat(this.percentage).toFixed(0) + ' %'}
              </Text>
            </View>
          */}
        </View>
      </View>
    )
  }
}

PyramidBar.propTypes = {
  scaleFactor: PropTypes.number,
  pyramidStage: PropTypes.object,
  pyramidWidth: PropTypes.number.isRequired,
  pyramidContainerWidth: PropTypes.number.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  button: {
    color: '#ffffff'
  },
  buttonContainer: {
    padding: 10,
    height: 45,
    borderRadius: 5,
    backgroundColor: Colors.buttons.common.background,
    margin: 20,
    marginTop: 10,
    justifyContent: 'center'
  },
  selectionBar: {
    height: 50,
    justifyContent: 'center',
    margin: 20
  },
  selectionTitle: {
    color: Colors.main.grey1,
    fontSize: 20,
    fontWeight: '200'
  },
  missingDataText: {
    padding: 20,
    color: Colors.main.grey1
  },
  includingDaysTitle: {
    marginTop: 10,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
    flex: 1,
    backgroundColor: '#526E7C',
    color: '#fff'
  },
  includingDays: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
    color: Colors.main.grey1
  }
})
