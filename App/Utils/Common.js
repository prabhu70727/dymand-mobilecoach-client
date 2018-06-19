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
}
