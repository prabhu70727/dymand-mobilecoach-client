import {FoodList} from './Food'
import R from 'ramda'

import Log from '../../Utils/Log'
const log = new Log('Containers/AddMealModule/FoodMetrics')

export const MealTypes = { BREAKFAST: 'BREAKFAST', SECOND_BREAKFAST: 'SECOND_BREAKFAST', LUNCH: 'LUNCH', AFTERNOON_SNACK: 'AFTERNOON_SNACK', DINNER: 'DINNER', LATE_MEAL: 'LATE_MEAL', DRINK_FOOD_OTHER: 'DRINK_FOOD_OTHER' }
export const MealTypeArray = [MealTypes.DRINK_FOOD_OTHER, MealTypes.LATE_MEAL, MealTypes.DINNER, MealTypes.AFTERNOON_SNACK, MealTypes.LUNCH, MealTypes.SECOND_BREAKFAST, MealTypes.BREAKFAST]
export const MealPlaces = {HOME: 'HOME', EAT_OUT: 'EAT_OUT'}
export const EatOutOptions = {TAKE_AWAY: 'EAT_OUT_OPTIONS.TAKE_AWAY', FAST_FOOD: 'EAT_OUT_OPTIONS.FAST_FOOD', RESTAURANT: 'EAT_OUT_OPTIONS.RESTAURANT', WORK_RESTAURANT: 'EAT_OUT_OPTIONS.WORK_RESTAURANT', FRIENDS: 'EAT_OUT_OPTIONS.FRIENDS', MISC: 'EAT_OUT_OPTIONS.MISC'}
export const FoodUnitIds = { GRAM: 0, MILLILITER: 1 } // CENTILITER: 3, PIECE: 4, SLICE: 5, TEASPOON: 6, TABLESPOON: 7, MILLILITER: 8, LITER: 9, CUP: 10, PACK: 11, GLASS: 12, DECILITER: 13, BOTTLE: 14, CAN: 15, SCOOP: 16 }
export const FoodUnits = {0: { 'unitNameDE': 'Gramm', 'unitId': 0 }, 1: { 'unitNameDE': 'Milliliter', 'unitId': 1 }}
export const unitShortForms = ['g', 'ml']

export const FoodCategories = [
  {
    id: 50,
    categoryName: 'Apéro/Vorspeisen'
  },
  {
    id: 21,
    categoryName: 'Brot & Backwaren',
    info: true
  },
  {
    id: 55,
    categoryName: 'Brotaufstriche süss & würzig'
  },
  {
    id: 23,
    categoryName: 'Cerealien/Müesli'
  },
  {
    id: 30,
    categoryName: 'Desserts/Süssspeisen'
  },
  {
    id: 52,
    categoryName: 'Dressings'
  },
  {
    id: 42,
    categoryName: 'Eiprodukte'
  },
  {
    id: 3,
    categoryName: 'Feinbackwaren/Patisserie',
    info: true
  },
  {
    id: 7,
    categoryName: 'Fette & Öle'
  },
  {
    id: 8,
    categoryName: 'Fische'
  },
  {
    id: 10,
    categoryName: 'Fleisch'
  },
  {
    id: 12,
    categoryName: 'Fleischersatzprodukte (Veggie-Produkte)'
  },
  {
    id: 11,
    categoryName: 'Fleischprodukte & Wurstwaren'
  },
  {
    id: 49,
    categoryName: 'Flocken & Körner'
  },
  {
    id: 13,
    categoryName: 'Früchte'
  },
  {
    id: 17,
    categoryName: 'Gemüse'
  },
  {
    id: 1,
    categoryName: 'Getränke, alkoholfrei'
  },
  {
    id: 2,
    categoryName: 'Getränke, alkoholhaltig'
  },
  {
    id: 58,
    categoryName: 'Getränkepulver'
  },
  {
    id: 22,
    categoryName: 'Getreide-Stärkebeilagen'
  },
  {
    id: 32,
    categoryName: 'Hauptgerichte',
    info: true
  },
  {
    id: 26,
    categoryName: 'Hülsenfrüchte'
  },
  {
    id: 28,
    categoryName: 'Kartoffelähnliche Wurzeln'
  },
  {
    id: 44,
    categoryName: 'Kartoffelprodukte'
  },
  {
    id: 15,
    categoryName: 'Kerne & Samen'
  },
  {
    id: 9,
    categoryName: 'Meeresfrüchte'
  },
  {
    id: 31,
    categoryName: 'Milchersatzprodukte'
  },
  {
    id: 38,
    categoryName: 'Milchprodukte (Kuh, Schaf, Ziege)',
    info: true
  },
  {
    id: 16,
    categoryName: 'Nüsse'
  },
  {
    id: 19,
    categoryName: 'Pilze'
  },
  {
    id: 41,
    categoryName: 'Pizzas',
    info: true
  },
  {
    id: 18,
    categoryName: 'Salate',
    info: true
  },
  {
    id: 36,
    categoryName: 'Salate, angemacht',
    info: true
  },
  {
    id: 40,
    categoryName: 'Salzige Snacks'
  },
  {
    id: 45,
    categoryName: 'Sandwiches',
    info: true
  },
  {
    id: 53,
    categoryName: 'Saucen',
    info: true
  },
  {
    id: 34,
    categoryName: 'Schnell-/Fertiggerichte',
    info: true
  },
  {
    id: 57,
    categoryName: 'Süssungsmittel'
  },
  {
    id: 4,
    categoryName: 'Süsswaren'
  },
  {
    id: 51,
    categoryName: 'Suppen & Bouillons'
  },
  {
    id: 54,
    categoryName: 'Würzsaucen & Dips'
  }
]

export const PyramidStages = [
  {
    unscaledWidth: 990,
    color: '#C0E7E5',
    stage: 1
  },
  {
    unscaledWidth: 833,
    color: '#33A02C',
    stage: 2
  },
  {
    unscaledWidth: 678,
    color: '#CDAF75',
    stage: 3
  },
  {
    unscaledWidth: 523,
    color: '#FE1109',
    stage: 4
  },
  {
    unscaledWidth: 367,
    color: '#FFFA7E',
    stage: 5
  },
  {
    unscaledWidth: 212,
    color: '#313E99',
    stage: 6
  }
]

export const stageCalculations = {
  '6.24': {
    portionSize: 15,
    portionFactor: 1,
    percentPerUnit: (100 / 15),
    unitId: FoodUnitIds.GRAM
  },
  '6.24a': {
    portionSize: 5,
    portionFactor: 1,
    percentPerUnit: (100 / 5),
    unitId: FoodUnitIds.GRAM
  },
  '6.25': {
    portionSize: 90,
    portionFactor: 1,
    percentPerUnit: (100 / 90),
    unitId: FoodUnitIds.GRAM
  },
  '6.26': {
    portionSize: 20,
    portionFactor: 1,
    percentPerUnit: (100 / 20),
    unitId: FoodUnitIds.GRAM
  },
  '6.27': {
    portionSize: 90,
    portionFactor: 1,
    percentPerUnit: (100 / 90),
    unitId: FoodUnitIds.GRAM
  },
  '6.28': {
    portionSize: 25,
    portionFactor: 1,
    percentPerUnit: (100 / 25),
    unitId: FoodUnitIds.GRAM
  },
  '6.29': {
    portionSize: 250,
    portionFactor: 1,
    percentPerUnit: (100 / 250),
    unitId: FoodUnitIds.MILLILITER
  },
  '6.30': {
    portionSize: 300,
    portionFactor: 1,
    percentPerUnit: (100 / 300),
    unitId: FoodUnitIds.MILLILITER
  },
  '6.31a': {
    portionSize: 30,
    portionFactor: 1,
    percentPerUnit: (100 / 30),
    unitId: FoodUnitIds.MILLILITER
  },
  '6.31': {
    portionSize: 100,
    portionFactor: 1,
    percentPerUnit: (100 / 100),
    unitId: FoodUnitIds.MILLILITER
  },
  '5.20': {
    portionSize: 25,
    portionFactor: (1 / 3),
    percentPerUnit: (100 / 25),
    unitId: FoodUnitIds.GRAM
  },
  '5.21': {
    portionSize: 10,
    portionFactor: (0.5 / 3),
    percentPerUnit: (100 / (0.5 * 10)),
    unitId: FoodUnitIds.GRAM
  },
  '5.22': {
    portionSize: 10,
    portionFactor: (0.5 / 3),
    percentPerUnit: (100 / (0.5 * 10)),
    unitId: FoodUnitIds.GRAM
  },
  '5.23': {
    portionSize: 25,
    portionFactor: (1 / 3),
    percentPerUnit: (100 / 25),
    unitId: FoodUnitIds.GRAM
  },
  '4.11': {
    portionSize: 200,
    portionFactor: (3 / 4),
    percentPerUnit: (100 / (3 * 200)),
    unitId: FoodUnitIds.GRAM
  },
  '4.12': {
    portionSize: 180,
    portionFactor: (3 / 4),
    percentPerUnit: (100 / (3 * 180)),
    unitId: FoodUnitIds.GRAM
  },
  '4.13': {
    portionSize: 60,
    portionFactor: (3 / 4),
    percentPerUnit: (100 / (3 * 60)),
    unitId: FoodUnitIds.GRAM
  },
  '4.14': {
    portionSize: 30,
    portionFactor: (3 / 4),
    percentPerUnit: (100 / (3 * 30)),
    unitId: FoodUnitIds.GRAM
  },
  '4.15': {
    portionSize: 110,
    portionFactor: (1 / 4),
    percentPerUnit: (100 / 110),
    unitId: FoodUnitIds.GRAM
  },
  '4.16': {
    portionSize: 110,
    portionFactor: (1 / 4),
    percentPerUnit: (100 / 110),
    unitId: FoodUnitIds.GRAM
  },
  '4.17': {
    portionSize: 110,
    portionFactor: (1 / 4),
    percentPerUnit: (100 / 110),
    unitId: FoodUnitIds.GRAM
  },
  '4.18': {
    portionSize: 110,
    portionFactor: (1 / 4),
    percentPerUnit: (100 / 110),
    unitId: FoodUnitIds.GRAM
  },
  '4.12a': {
    portionSize: 190,
    portionFactor: (3 / 4),
    percentPerUnit: (100 / 190),
    unitId: FoodUnitIds.GRAM
  },
  '4.19b': {
    portionSize: 110,
    portionFactor: (1 / 4),
    percentPerUnit: (100 / 110),
    unitId: FoodUnitIds.GRAM
  },
  '3.7': {
    portionSize: 240,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 240)),
    unitId: FoodUnitIds.GRAM
  },
  '3.8': {
    portionSize: 90,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 90)),
    unitId: FoodUnitIds.GRAM
  },
  '3.9': {
    portionSize: 150,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 150)),
    unitId: FoodUnitIds.GRAM
  },
  '3.10a': {
    portionSize: 60,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 60)),
    unitId: FoodUnitIds.GRAM
  },
  '3.10b': {
    portionSize: 100,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 100)),
    unitId: FoodUnitIds.GRAM
  },
  '3.10c': {
    portionSize: 200,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 200)),
    unitId: FoodUnitIds.GRAM
  },
  '3.10d': {
    portionSize: 150,
    portionFactor: 1,
    percentPerUnit: (100 / (3 * 150)),
    unitId: FoodUnitIds.GRAM
  },
  '2.4': {
    portionSize: 120,
    portionFactor: (3 / 5),
    percentPerUnit: (100 / (3 * 120)),
    unitId: FoodUnitIds.GRAM
  },
  '2.5': {
    portionSize: 120,
    portionFactor: (2 / 5),
    percentPerUnit: (100 / (2 * 120)),
    unitId: FoodUnitIds.GRAM
  },
  '2.6': {
    portionSize: 200,
    portionFactor: (2 / 5),
    percentPerUnit: (100 / (2 * 200)),
    unitId: FoodUnitIds.GRAM
  },
  '2.6a': {
    portionSize: 200,
    portionFactor: (3 / 5),
    percentPerUnit: (100 / (3 * 200)),
    unitId: FoodUnitIds.GRAM
  },
  '1.1': {
    portionSize: 1000,
    portionFactor: 1,
    percentPerUnit: (100 / 1000),
    unitId: FoodUnitIds.MILLILITER
  },
  '1.2': {
    portionSize: 1000,
    portionFactor: 1,
    percentPerUnit: (100 / 1000),
    unitId: FoodUnitIds.MILLILITER
  },
  '1.3': {
    portionSize: 1000,
    portionFactor: 1,
    percentPerUnit: (100 / 1000),
    unitId: FoodUnitIds.MILLILITER
  }
}

export const getFoodByName = (foodnameDE) => {
  for (var i = 0, len = FoodList.length; i < len; i++) {
    let food = FoodList[i]
    if (food.foodnameDE === foodnameDE) return R.clone(food)
  }
}

export function computeStagePercentage (meals, pyramidStage) {
  // log.info('Computing Stage-Percentage for Stage', pyramidStage.stage)
  let filteredFood = []
  let percentage = 0
  meals.forEach(meal => {
    let stageFood = meal.food
    let foodFilter = (food) => {
      let containsStage = false
      food.pyramidStages.forEach((stage) => {
        if (pyramidStage.stage + '' === stage.level.charAt(0) + '') {
          containsStage = true
        }
      })
      return containsStage
    }
    // Add all relevant food of this meal
    let filteredStageFood = stageFood.filter(foodFilter)
    filteredFood = filteredFood.concat(filteredStageFood)
  })
  filteredFood.forEach((food) => {
    food.pyramidStages.forEach((stage) => {
      if (pyramidStage.stage + '' === stage.level.charAt(0) + '') {
        // calculate the percentage delta for this food
        let percentageToAdd = getPercentaceDelta(stage, food)
        // ..and add it to the stage-percentage
        percentage = percentage + percentageToAdd
      }
    })
  })
  log.info('Calculated a total of', percentage, 'percent for Stage', pyramidStage.stage)
  return percentage
}

export function getPercentaceDelta (stage, food) {
  const stageCalculation = stageCalculations[stage.fullStageName]
  let percentPerUnit = stageCalculation.percentPerUnit
  let gram = food.calculatedGram
  // if (stage.level === '3') console.log((percentPerUnit * gram * stage.stageFactor * stageCalculation.portionFactor), 'Percent where added for', gram, 'grams of', food.foodnameDE)
  // TODO: at the moment, substages can substitude each other regarding their base-stage. This might not be the desired behaviour..
  let percentageToAdd = percentPerUnit * gram * stage.stageFactor * stageCalculation.portionFactor
  // check if the result is a numeric value
  if (isNaN(percentageToAdd)) {
    log.warn('Could not calculate percentage for', gram, 'grams of', food.foodnameDE, '(Selected unit:', food.selectedAmount.value, food.selectedAmount.unit.unitNameDE, ')')
    log.warn('percentPerUnit: ' + percentPerUnit + ' Gram: ' + gram + ' StageFactor: ' + stage.stageFactor + ' portionFactor: ' + stageCalculation.portionFactor)
    return 0
  } else return percentageToAdd
}

export function getBaseUnit (food) {
  if (typeof food.pyramidStages[0] !== 'undefined') {
    // Return ml for stages where ml is main unit
    if (food.pyramidStages.length === 1 && ['1.1', '1.2', '1.3', '2.6', '4.11', '6.30', '6.31a', '6.31'].includes(food.pyramidStages[0].fullStageName)) return 'ml'
  }
  // otherwise return gram as default
  return 'g'
}
