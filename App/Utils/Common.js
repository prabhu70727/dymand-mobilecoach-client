import { DOMParser } from 'react-native-html-parser'

export default class Common {
  static parseCommand (commandString) {
    const commandArray = commandString.split(' ')
    let command = commandArray[0]
    let value = null
    if (commandArray.length > 1) {
      value = commandArray[1]
    }

    const valuesOnlyArray = commandArray.slice(1)

    return { command, value, values: valuesOnlyArray, content: valuesOnlyArray.join(' '), contentWithoutFirstValue: valuesOnlyArray.slice(1).join(' ') }
  }

  static formatInfoMessage (content, timestamp) {
    // let content = serverMessage.content  // .replace(/\n/g, '')
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
    return {
      // Info-Content delievered by server in DS-Message
      content,
      // Component to be opened on Tap
      component: 'rich-text',
      title,
      subtitle,
      time: timestamp
    }
  }
}
