import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import moment from 'moment'
import R from 'ramda'
import update from 'immutability-helper'
import { MessageActions } from './MessageRedux'

const { Types, Creators } = createActions({
  foodDiaryAddMeal: ['meal'],
  foodDiaryRemoveMeal: ['meal'],
  foodDiaryAddRecentlyAddedFood: ['food'],
  foodDiaryStartNewTrackingPeriod: [],
  mealIdIncrementer: 0
})

export const FoodDiaryActions = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_TRACKING_PERIOD = Immutable({
  meals: [],
  trackedDaysComplete: [],
  trackedDaysIncomplete: [],
  completed: false
})

export const INITIAL_STATE = Immutable({
  trackingPeriods: [],
  activeTrackingPeriod: null,
  trackedDays: [],
  circumstances: {},
  recentlyAddedFood: [],
  mealIdIncrementer: 0
})

/* ------------- Reducers ------------- */

// add a Meal to the store
export const startNewTrackingPeriod = (state) => {
  let trackingPeriod = R.clone(INITIAL_TRACKING_PERIOD)
  let trackingPeriods = R.clone(state.trackingPeriods)
  trackingPeriods.push(trackingPeriod)

  return {
    ...state,
    trackingPeriods,
    activeTrackingPeriod: state.activeTrackingPeriod + 1
  }
}

// add a Meal to the store
export const addMeal = (state, { meal }) => {
  let mealIdIncrementer = state.mealIdIncrementer
  meal['id'] = mealIdIncrementer
  mealIdIncrementer = mealIdIncrementer + 1
  let day = moment(meal.mealTime).format('YYYY-MM-DD')
  // first add new day
  let trackedDays = [...state.trackedDays]
  // then filter doubles using Set
  if (!trackedDays.includes(day)) {
    trackedDays.push(day)
  }
  // sort array by date
  trackedDays.sort((a, b) => {
    return new Date(b) - new Date(a)
  })
  let newTrackedDays = [...trackedDays]
  const activeTrackingPeriodIndex = state.activeTrackingPeriod
  return update(state, {
    trackingPeriods: {[activeTrackingPeriodIndex]: {meals: {$push: [meal]}}},
    trackedDays: {$set: newTrackedDays},
    mealIdIncrementer: {$set: mealIdIncrementer}
  })
}

// add a Meal to the store
export const removeMeal = (state, { meal }) => {
  const activeTrackingPeriodIndex = state.activeTrackingPeriod
  let newMeals = state.trackingPeriods[activeTrackingPeriodIndex].meals.filter((currentMeal) => { return meal.id !== currentMeal.id })

  let newTrackedDays = [...state.trackedDays]
  // check if this was the last remaining meal of this day
  let meals = []
  state.trackingPeriods.forEach((trackingPeriod) => {
    meals = [...meals, ...trackingPeriod.meals]
  })
  meals = meals.filter((currentMeal) => {
    return currentMeal.mealDate === meal.mealDate
  })
  // if it's the last meal of this day, remove it from trackedDays array
  if (meals.length < 2) {
    newTrackedDays = newTrackedDays.filter((date) => {
      return date !== moment(meal.mealTime).format('YYYY-MM-DD')
    })
  }
  return update(state, {
    trackingPeriods: {[activeTrackingPeriodIndex]: {meals: {$set: newMeals}}},
    trackedDays: {$set: newTrackedDays}
  })
}

export const addRecentlyAddedFood = (state, { food }) => {
  let newArr = []
  let oldArr = state.recentlyAddedFood
  for (let i = 0; i < oldArr.length; i++) {
    let item = oldArr[i]
    // Check if we already have this food id in our list
    if (item.id !== food.id) newArr.push(item)
  }
  // put the new item on fist place
  newArr.unshift(food)
  // only store 20 last items
  newArr = newArr.slice(0, 20)
  return {
    ...state,
    recentlyAddedFood: newArr
  }
}

// {
// type: 'COMMAND_TO_EXECUTE',
// command: 'tracked-day-complete 01.12.2017'
// }

export const handleProgressCommand = (state, {command, content}) => {
  const commandWithValue = command.split(' ')
  const onlyCommand = commandWithValue[0]
  const activeTrackingPeriodIndex = state.activeTrackingPeriod
  const {trackingPeriods} = state
  switch (onlyCommand) {
    // Add a complete day to the current trackingPeriod
    case 'tracked-day-complete':
      let completeDate = commandWithValue[1]
      let newTrackedDaysComplete = [...trackingPeriods[activeTrackingPeriodIndex].trackedDaysComplete]
      if (!newTrackedDaysComplete.includes(completeDate)) {
        newTrackedDaysComplete.push(completeDate)
        // sort days
        newTrackedDaysComplete.sort((a, b) => {
          // Convert to format which is better sortable
          let dateA = moment(a, 'DD.MM.YYYY').format('YYYYMMDD')
          let dateB = moment(b, 'DD.MM.YYYY').format('YYYYMMDD')
          return (dateA > dateB) ? -1 : (dateA < dateB) ? 1 : 0
        })
      }
      return update(state, {
        trackingPeriods: {[activeTrackingPeriodIndex]: {trackedDaysComplete: {$set: newTrackedDaysComplete}}}
      })
    case 'tracked-day-incomplete':
      let incompleteDate = commandWithValue[1]
      let newTrackedDaysIncomplete = [...trackingPeriods[activeTrackingPeriodIndex].trackedDaysIncomplete]
      if (!newTrackedDaysIncomplete.includes(incompleteDate)) {
        newTrackedDaysIncomplete.push(incompleteDate)
        // sort days
        newTrackedDaysIncomplete.sort((a, b) => {
          return new Date(b) - new Date(a)
        })
      }
      return update(state, {
        trackingPeriods: {[activeTrackingPeriodIndex]: {trackedDaysIncomplete: {$set: newTrackedDaysIncomplete}}}
      })
    case 'tracked-day-circumstances':
      const circumstances = ['ordinary', 'shortTime', 'sick', 'vacation', 'noAppetite', 'invited', 'other']
      let date = commandWithValue[1]
      let circumstance = circumstances[commandWithValue[2]]
      let newCircumstances = R.clone(state.circumstances)
      newCircumstances[date] = circumstance
      return {
        ...state,
        circumstances: newCircumstances
      }
    case 'tracking-period-started':
      // new Index is length of the previous array (e.g. 3 Periods-> [0,1,2] -> new Period [0,1,2,3] <- new index: 3)
      let periodIndex = state.trackingPeriods.length
      let newTrackingPeriod = R.clone(INITIAL_TRACKING_PERIOD)
      return update(state, {
        trackingPeriods: {$push: [newTrackingPeriod]},
        activeTrackingPeriod: {$set: periodIndex}
      })
    case 'tracking-period-complete':
      return update(state, {
        trackingPeriods: {[activeTrackingPeriodIndex]: {completed: {$set: true}}}
      })
    default:
      return state
  }
}

/* ------------- Hookup Reducers To Actions ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.FOOD_DIARY_ADD_MEAL]: addMeal,
  [Types.FOOD_DIARY_REMOVE_MEAL]: removeMeal,
  [Types.FOOD_DIARY_ADD_RECENTLY_ADDED_FOOD]: addRecentlyAddedFood,
  [Types.FOOD_DIARY_START_NEW_TRACKING_PERIOD]: startNewTrackingPeriod,
  [MessageActions.COMMAND_TO_EXECUTE]: handleProgressCommand
})
