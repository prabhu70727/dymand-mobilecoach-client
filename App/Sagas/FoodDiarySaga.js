
import { takeEvery, put, select } from 'redux-saga/effects'

import { stageCalculations } from '../Containers/AddMealModule/FoodMetrics'
import { MessageActions } from '../Redux/MessageRedux'
import { getMealsOfDate } from '../Redux/Selectors'

import Log from '../Utils/Log'
const log = new Log('Sagas/FoodDiarySaga')

// This saga watches for new messages from the server which will always dispatched with type "NEW_OR_UPDATED_MESSAGE_FOR_GIFTED_CHAT"
export function * watchCommandToExecute (action) {
  yield takeEvery('COMMAND_TO_EXECUTE', handleCommand)
}

// Our worker Saga: will perform the async increment task
export function * handleCommand (action) {
  const {command} = action
  const commandWithValue = command.split(' ')
  const onlyCommand = commandWithValue[0]
  switch (onlyCommand) {
    // Send meals of day either way (complete or incomplete)
    case 'tracked-day-complete':
    case 'tracked-day-incomplete':
      let day = commandWithValue[1]
      const meals = yield select(getMealsOfDate, day)
      // Only send tracked day to server if it contains meals
      if (meals.length > 0) {
        let formattedMeals = formatMealsForServer(meals)
        yield put({ type: MessageActions.SEND_INTENTION, text: null, intention: 'add-tracked-meals', content: formattedMeals })
      }
  }
}

function formatMealsForServer (meals) {
  let serverMeals = []
  meals.forEach((meal, index, meals) => {
    let serverMeal = {
      mealType: meal.mealType,
      mealDate: meal.mealDate,
      mealPlace: meal.mealPlace,
      food: []
    }
    meal.food.forEach((food) => {
      let serverFood = {
        foodnameDE: food.foodnameDE,
        foodnameIT: food.foodnameIT,
        foodnameFR: food.foodnameFR,
        pyramidStages: []
      }
      food.pyramidStages.forEach((stage) => {
        let stageCalculation = stageCalculations[stage.fullStageName]
        if (typeof stageCalculation === 'undefined') log.warn('Could not find Stage-Calculations for stage', stage.fullStageName, 'at Food', food.foodnameDE)
        else {
          let stageGrams = stage.stageFactor * food.calculatedGram
          let stagePortion = stageGrams / stageCalculation.portionSize
          let pyramidStage = {
            stageDetail: stage.fullStageName,
            stage: stage.level,
            stagePortion,
            gram: stageGrams
          }
          serverFood.pyramidStages.push(pyramidStage)
        }
      })
      serverMeal.food.push(serverFood)
    })
    serverMeals.push(serverMeal)
  })
  return serverMeals
}

export function * sendMealsToServer (meals) {
  yield put(MessageActions.sendIntention('', 'add-meal', meals))
}
