import RNFetchBlob from 'react-native-fetch-blob'
import FileViewer from 'react-native-file-viewer'
import moment from 'moment'
import I18n from '../I18n/I18n'
import {getBaseUnit} from '../Containers/AddMealModule/FoodMetrics'

import Log from './Log'
const log = new Log('Containers/Settings/Settings')

export default class PDFGenerator {
  constructor () {
    this.fonts = require('../Data/PDFFonts.js')
    const {vfs} = this.fonts.default
    this.pdfMake = require('pdfmake/build/pdfmake')
    this.pdfMake.vfs = vfs
    this.pdfMake.fonts = {
      'Roboto': {
        normal: 'Roboto-Light.ttf',
        bold: 'Roboto-Light.ttf',
        italics: 'Roboto-Light.ttf',
        bolditalics: 'Roboto-Light.ttf'
      }
    }
  }

  createPDF (foodDiary) {
    const fs = RNFetchBlob.fs
    const DocumentDir = RNFetchBlob.fs.dirs.DocumentDir
    let docDefinition = this.definePDFContent(foodDiary)
    let pdfDocGenerator = this.pdfMake.createPdf(docDefinition)
    pdfDocGenerator.getBase64(function (base64) {
      // showModal('pdf-view', {source: base64})
      let pdfLocation = DocumentDir + '/FoodDiary.pdf'
      fs.writeFile(pdfLocation, base64, 'base64').then(() => {
        FileViewer.open(pdfLocation).then(() => {
          log.info('Opened PDF successfully')
        }).catch((error) => {
          // TODO: Fallback solution if there is no PDF-Viewer installed?
          log.error(error)
        })
      }).catch((error) => {
        log.error(error)
      })
    })
  }

  defineHeader () {
    return (
        (pagenumber, pagecount) => {
          return {
            stack: [
              {
                text: [
                  'BLV FoodTour: ',
                  {text: I18n.t('PDFExport.title'), fontSize: 14}
                ],
                style: 'header'
              },
              {
                canvas: [{ type: 'line', x1: 0, y1: 10, x2: 595 - 130, y2: 10, lineWidth: 0.5 }]
              }
            ],
            margin: [72, 70]
          }
        }
    )
  }

  definePDFContent (foodDiary) {
    let daysDefinition = this.defineDays(foodDiary)
    let header = this.defineHeader()
    let dd = {
      header: header,
      footer: function (pagenumber, pagecount) {
        return {
          stack: [
            {
              text: I18n.t('PDFExport.page') + ' ' + pagenumber + ' ' + I18n.t('PDFExport.of') + ' ' + pagecount,
              alignment: 'right'
            }
          ],
          margin: [72, 40]
        }
      },
      content: {
        stack: daysDefinition
      },
      pageSize: 'LETTER',
      pageMargins: [72, 125],
      styles: {
        header: {
          fontSize: 14
        },
        dayStack: {
          margin: [0, 0, 0, 30]
        },
        dayTitle: {
          fontSize: 16,
          margin: [0, 0, 0, 10]
        },
        regular: {
          fontSize: 12
        },
        meal: {
          margin: [0, 15, 0, 0]
        },
        table: {
          margin: [0, 10, 0, 0]
        },
        tableHeader: {
          fillColor: '#dddddd',
          margin: [0, 5, 0, 5]
        },
        diaryTitle: {
          fontSize: 18,
          margin: [0, 0, 0, 20]
        }
      }
    }
    return dd
  }

  defineDays (foodDiary) {
    let daysDefinition = []
    const {trackedDays} = foodDiary
    for (let i = 0; i < foodDiary.trackingPeriods.length; i++) {
      daysDefinition.push({
        text: I18n.t('PDFExport.diaryNr') + (i + 1) + ': ',
        style: 'diaryTitle'
      })
      const trackingPeriod = foodDiary.trackingPeriods[i]
      for (let j = 0; j < trackedDays.length; j++) {
        const meals = trackingPeriod.meals.filter((meal) => {
          return moment(meal.mealTime).format('YYYY-MM-DD') === trackedDays[j]
        })
        // Only add day if there are meals
        if (meals.length > 0) {
          const m = moment(meals[0].mealTime)
          let dayFormat = m.format('LLLL').replace(m.format('LT'), '')
          let circumstances = I18n.t('FoodDiary.nodata')
          if (typeof foodDiary.circumstances[meals[0].mealDate] !== 'undefined') circumstances = I18n.t('FoodDiary.' + foodDiary.circumstances[meals[0].mealDate])
          let dayStack = [
            {
              text: dayFormat,
              style: 'dayTitle'
            },
            {
              text: I18n.t('PDFExport.text1') + ': ' + circumstances,
              style: 'regular'
            }
          ]
          for (let i = 0; i < meals.length; i++) {
            let meal = meals[i]
            let mealDefinition = this.defineMeal(meal)
            dayStack.push(mealDefinition)
          }
          daysDefinition.push({
            style: 'dayStack',
            stack: dayStack
          })
        }
      }
    }
    return daysDefinition
  }

  defineMeal (meal) {
    let foodDefinition = this.defineFood(meal.food)
    let mealDefinition = {
      stack: [
        {
          alignment: 'justify',
          columnGap: 20,
          columns: [
            {
              text: [I18n.t('FoodDiary.mealtype') + ': ', {text: I18n.t('FoodDiary.' + meal.mealType) + ' (' + moment(meal.mealTime).format('hh:mm') + ')'}]
            },
            {
              text: [I18n.t('FoodDiary.mealplace') + ': ', {text: I18n.t('FoodDiary.' + meal.mealPlace)}]
            }
          ]
        },
        {
          style: 'table',
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            // dontBreakRows: true,
            // keepWithHeaderRows: 1,
            body: foodDefinition
          }
        }
      ],
      style: 'meal'
      // --- END SINGLE MEAL ---
    }
    return mealDefinition
  }

  defineFood (food) {
    let foodStack = [
      [
        {text: I18n.t('PDFExport.food'), style: 'tableHeader'},
        {text: I18n.t('PDFExport.selectedAmount'), style: 'tableHeader'},
        {text: I18n.t('PDFExport.calculatedGram'), style: 'tableHeader'}
      ]
    ]
    for (let i = 0; i < food.length; i++) {
      let foodRow = [
        food[i].foodnameDE,
        food[i].selectedAmount.value + ' ' + I18n.t('FoodUnits.' + food[i].selectedAmount.unit.unitId),
        food[i].calculatedGram + ' ' + getBaseUnit(food[i])
      ]
      foodStack.push(foodRow)
    }
    return foodStack
  }
}
