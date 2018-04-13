import { createSelector } from 'reselect'
import { DOMParser } from 'react-native-html-parser'
/* ------------- Selectors ------------- */

const getMessages = state => state.messages

export const getActiveTrackingPeriod = (state) => {
  return state.fooddiary.trackingPeriods[state.fooddiary.activeTrackingPeriod]
}

export const getMealsOfDate = (state, date) => {
  let meals = []
  state.fooddiary.trackingPeriods.forEach((trackingPeriod) => {
    meals = [...meals, ...trackingPeriod.meals]
  })
  return meals.filter((meal) => {
    return meal.mealDate === date
  })
}

export const getActiveScreen = (state) => {
  return state.nav.routes[state.nav.index].routeName
}

// returns all days that have either been finally marked complete or incomplete
export const getNonEditableDays = (state) => {
  let nonEditableDays = []
  state.fooddiary.trackingPeriods.forEach((trackingPeriod) => {
    // concat arrays of non-editable days while removing duplicates (even though there shouldn't be any..)
    nonEditableDays = [...nonEditableDays, ...trackingPeriod.trackedDaysComplete, ...trackingPeriod.trackedDaysIncomplete]
  })
  return nonEditableDays
}

const getCommandMessages = createSelector(
  [getMessages],
  (messages) => {
    let commandMessages = []
    for (let message in messages) {
      if (messages.hasOwnProperty(message) && messages[message].type === 'COMMAND') {
        commandMessages.push(messages[message])
      }
    }
    return commandMessages
  }
)
// show-backpack-info
export const getBackpackInformation = createSelector(
  [getCommandMessages],
  (commandMessages) => {
    let information = []
    let filtered = commandMessages.filter(message => message['server-message'] === 'show-backpack-info')
    filtered.forEach((serverMessage) => {
      let content = serverMessage.content  // .replace(/\n/g, '')
      let parsedTags = new DOMParser().parseFromString(content, 'text/html')
      let meta = parsedTags.getElementsByTagName('meta')[0]
      let title = ''
      let subtitle = ''
      if (meta) {
        title = meta.getAttribute('title').replace('\\n', '\n')
        subtitle = meta.getAttribute('subtitle').replace('\\n', '\n')
      }

      // Remove Button
      const pattern = new RegExp('<button>(.*)</button>', 'g')
      const regExpResult = pattern.exec(content)
      if (regExpResult) {
        content = content.replace(regExpResult[0], '')
      }
      let info = {
        // Info-Content delievered by server in DS-Message
        content,
        // Component to be opened on Tap
        component: 'rich-text',
        title,
        subtitle,
        time: serverMessage['message-timestamp']
      }
      information.push(info)
    })
    return information
  }
)
