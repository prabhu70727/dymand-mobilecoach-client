import React, {Component} from 'react'
import {View, ScrollView, Text, StyleSheet, Alert} from 'react-native'
import {connect} from 'react-redux'
// import R from 'ramda'
// import PropTypes from 'prop-types'
import Accordion from 'react-native-collapsible/Accordion'
import * as Animatable from 'react-native-animatable'
import moment from 'moment'
import { Icon } from 'react-native-elements'
import I18n from '../../I18n/I18n'

import MealListView from '../AddMealModule/MealListView'
import {Colors} from '../../Themes/'
import FoodDiaryActions from '../../Redux/FoodDiaryRedux'

import Log from '../../Utils/Log'
const log = new Log('FoodDiary/DiaryView')

class DiaryView extends Component {
  componentWillReceiveProps () {
    this._setSection(this.props.foodDiary.trackedDays[0])
  }
  _setSection (section) {
    this.setState({ activeSection: section })
  }

  _getMeals (date) {
    const { foodDiary } = this.props
    let meals = []
    // get all meals from all tracking-periods
    foodDiary.trackingPeriods.forEach((period) => {
      period.meals.forEach((meal) => meals.push(meal))
    })

    let dateFilter = (meal) => {
      let mealDate = moment(meal.mealTime).format('YYYY-MM-DD')
      return mealDate === date
    }
    let filteredMeals = meals.filter(dateFilter)
    // sort meals by time
    filteredMeals.sort((a, b) => { return new Date(a.mealTime).getTime() - new Date(b.mealTime).getTime() })
    return filteredMeals
  }

  _renderHeader = (section, i, isActive) => {
    let today = moment(new Date()).format('YYYY-MM-DD')
    let yesterday = moment(today, 'YYYY-MM-DD').subtract(1, 'd').format('YYYY-MM-DD')
    let date = moment(section, 'YYYY-MM-DD')

    let title = date.format('DD.MM.YYYY')
    if (section === today) title = title + ' (' + I18n.t('Common.today') + ')'
    if (section === yesterday) title = title + ' (' + I18n.t('Common.yesterday') + ')'

    return (
      <Animatable.View duration={400} style={[styles.sectionHeader, isActive ? styles.sectionHeaderActive : null]} transition='backgroundColor'>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[styles.headerText, isActive ? styles.sectionHeaderTextActive : null]}>{title}</Text>
          {this.renderCompletedNotice(date.format('DD.MM.YYYY'))}
        </View>
      </Animatable.View>
    )
  }

  renderCompletedNotice (date) {
    const {foodDiary} = this.props
    const {trackingPeriods} = foodDiary
    const {activeTrackingPeriod} = foodDiary
    const {trackedDaysComplete} = foodDiary.trackingPeriods[activeTrackingPeriod]

    // Gather all days which have been marked as complete
    let allCompleteDays = []
    trackingPeriods.forEach((trackingPeriod) => {
      allCompleteDays = allCompleteDays.concat(trackingPeriod.trackedDaysComplete)
    })

    // Complete Days of current TrackingPeriod
    if (trackedDaysComplete.includes(date)) {
      let dayNumber = trackedDaysComplete.length - trackedDaysComplete.indexOf(date)
      return (
        <View style={styles.completedNotice}>
          <Text style={styles.completedText}>{I18n.t('FoodDiary.day') + ' ' + dayNumber}</Text>
          <Icon name='ios-checkmark-circle-outline' type='ionicon' size={20} color={Colors.main.primary} />
        </View>
      )
    } else if (allCompleteDays.includes(date)) {
      return (
        <View style={styles.completedNotice}>
          <Icon name='ios-checkmark-circle-outline' type='ionicon' size={20} color={Colors.main.primary} />
        </View>
      )
    }
  }

  _renderContent = (section, i, isActive) => {
    let meals = this._getMeals(section)

    return (
      <Animatable.View duration={400} style={[styles.content, isActive ? styles.active : styles.inactive]} transition='backgroundColor'>
        {meals.map((meal, i) => {
          return <MealListView key={i} meal={meal} onDeleteMeal={(meal) => this.onDeleteMeal(meal)} />
        })}
      </Animatable.View>
    )
  }

  onDeleteMeal (meal) {
    Alert.alert(
        I18n.t('FoodDiary.confirmDeleteMeal'),
        '',
      [
        {text: I18n.t('Settings.no'), onPress: () => {}, style: 'cancel'},
        {
          text: I18n.t('Settings.yes'),
          onPress: () => {
            log.info('Deleting Meal: ' + meal.mealType + ' (' + meal.mealDate + ')')
            log.action('Module', 'AddMeal', 'meal_deleted')
            this.props.removeMeal(meal)
          }
        }
      ],
        { cancelable: false }
    )
  }

  renderEmptyNotice () {
    const {foodDiary} = this.props
    if (foodDiary.trackedDays.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.missingDataText}>{I18n.t('FoodDiary.emptyNotice3')}</Text>
        </View>
      )
    } else return null
  }

  render () {
    const { trackedDays } = this.props.foodDiary
    return (
      <View style={styles.container}>
        <ScrollView style={[ styles.container, { backgroundColor: '#fff' } ]}>
          {this.renderEmptyNotice()}
          <Accordion
            initiallyActiveSection={0}
            sections={trackedDays}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
            duration={400}
          />
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    foodDiary: state.fooddiary,
    language: state.settings.language
  }
}

const mapStateToDispatch = dispatch => ({
  removeMeal: (meal) => dispatch(FoodDiaryActions.foodDiaryRemoveMeal(meal))
})

export default connect(mapStateToProps, mapStateToDispatch)(DiaryView)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  completedNotice: {
    flexDirection: 'row',
    paddingRight: 20,
    alignItems: 'center'
  },
  completedText: {
    color: Colors.main.primary,
    fontSize: 18,
    paddingRight: 5,
    fontWeight: '100'
  },
  sectionHeader: {
    backgroundColor: Colors.modules.foodDiary.items.background,
    height: 70,
    justifyContent: 'center',
    paddingLeft: 20,
    borderColor: Colors.modules.foodDiary.items.border,
    borderBottomWidth: 1
  },
  sectionHeaderActive: {
    backgroundColor: Colors.modules.foodDiary.items.backgroundActive
  },
  sectionHeaderTextActive: {
    color: Colors.modules.foodDiary.items.textActive
  },
  headerText: {
    color: Colors.modules.foodDiary.items.text,
    fontSize: 20,
    fontWeight: '200'
  },
  missingDataText: {
    padding: 20,
    color: Colors.main.grey1
  }
})
