import { Platform } from 'react-native'
import AppConfig from '../Config/AppConfig'
import { Crashlytics } from 'react-native-fabric'
import 'babel-polyfill'
import Piwik from 'react-native-piwik'

const LEVEL_TEXTS = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', OFF: 'OFF', CRASHLYTICS: 'CRASHLYTICS' }
const LEVEL_VALUES = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, OFF: 4, CRASHLYTICS: 5 }

const loggerLength = 20

const loggingCache = []
const loggingCacheSize = 500
let loggingCacheIndex = 0
let loggingCacheCount = 0

const defaultLevel = LEVEL_VALUES[AppConfig.config.logger.defaultLevel === undefined ? 'OFF' : AppConfig.config.logger.defaultLevel]
const loggerLevels = AppConfig.config.logger.loggerLevels === undefined ? {} : AppConfig.config.logger.loggerLevels

const logTrackingEvents = false

let trackActivities = false

let userIdSharedWithCrashlytics = false
let userIdSharedWithUserTracking = false

export default class Log {
  constructor (name) {
    if (name === undefined) {
      this.loggerName = 'GLOBAL'
    } else {
      this.loggerName = name
    }
  }

  setUser (userId) {
    Log.userId = userId
  }

  enableUserTracking () {
    // Only activate when tracking is switched on in general
    if (AppConfig.config.logger.trackActivities) {
      trackActivities = true
      const id = AppConfig.config.logger.trackingId
      Piwik.initTracker(AppConfig.config.logger.trackingURL, id)
      this.info('Activated activity tracker with id', id)
    }
  }

  debug (message) {
    Log.writeLog(this.loggerName, LEVEL_VALUES.DEBUG, arguments)
  }
  info (message) {
    Log.writeLog(this.loggerName, LEVEL_VALUES.INFO, arguments)
  }
  warn (message) {
    Log.writeLog(this.loggerName, LEVEL_VALUES.WARN, arguments)
  }
  error (message) {
    this.problem('ErrorOccured', Log.formatMessage(this.loggerName, LEVEL_TEXTS.ERROR, null, (arguments !== undefined && arguments !== null) ? Array.prototype.slice.call(arguments) : null))
    Log.writeLog(this.loggerName, LEVEL_VALUES.ERROR, arguments)
  }

  getCache () {
    return loggingCache
  }

  // Example: ProblemState, JSON...[, 0]
  problem (action = 'UNKNOWN', label = 'UNKNOWN', value = 0) {
    if (trackActivities) {
      if (!userIdSharedWithUserTracking && Log.userId !== undefined) {
        userIdSharedWithUserTracking = true
        this.action('User', 'Identifier', Log.userId)
      }

      if (logTrackingEvents) {
        console.info('[TRACKING] Problem: ' + action + ' ' + label + ' ' + value)
      }
      try {
        Piwik.trackEvent('Problem', action + '', label + '', value * 1)
      } catch (e) {
        // Don't do anything
      }
    }
  }
  // Example: GUIAction, ToggleMenu, false[, 0]
  action (category = 'UNDEFINED', action = 'UNKNOWN', label = 'UNKNOWN', value = 0) {
    if (trackActivities) {
      if (!userIdSharedWithUserTracking && Log.userId !== undefined) {
        userIdSharedWithUserTracking = true
        this.action('User', 'Identifier', Log.userId)
      }

      if (logTrackingEvents) {
        console.info('[TRACKING] Action: ' + category + ' ' + action + ' ' + label + ' ' + value)
      }
      try {
        Piwik.trackEvent(category, action + '', label + '', value * 1)
      } catch (e) {
        // Don't do anything
      }
    }
  }

  static writeLog (logger, level, messageArguments) {
    if (messageArguments === undefined || messageArguments === null) {
      messageArguments = []
    }

    // Logger is switched off
    if (defaultLevel === LEVEL_VALUES.OFF) {
      return
    }

    // Set compare level to default level or to level specifically defined for the appropriate logger
    let compareLevel = defaultLevel
    if (loggerLevels[logger] !== undefined) {
      compareLevel = LEVEL_VALUES[loggerLevels[logger]]
    }

    let method = null
    try {
      const stackTrace = Log.getStackTrace()
      method = stackTrace.split('\n')[4].split(' ')[5]
    } catch (error) {
      // do nothing
    }

    // Care for CRASHLYTICS logging
    if (defaultLevel === LEVEL_VALUES.CRASHLYTICS) {
      if (!userIdSharedWithCrashlytics && Log.userId !== undefined) {
        userIdSharedWithCrashlytics = true
        Crashlytics.setUserIdentifier(Log.userId)
      }
      let messages = Array.prototype.slice.call(messageArguments)
      const loggingMessage = Log.formatMessage(logger, Object.keys(LEVEL_TEXTS)[level], method, messages)

      if (level < 3) {
        Crashlytics.log(loggingMessage)
      } else {
        Crashlytics.log(loggingMessage)
        if (Platform.OS === 'ios') {
          Crashlytics.recordError('Exception - triggered by logger')
        } else {
          Crashlytics.logException('Exception - triggered by logger')
        }
      }

      loggingCache[loggingCacheIndex] = loggingCacheCount + ': ' + loggingMessage
      loggingCacheIndex++
      loggingCacheCount++
      if (loggingCacheIndex === loggingCacheSize) {
        loggingCacheIndex = 0
      }

      return
    }

    // Care for regular logging levels
    if (level >= compareLevel) {
      let messages = null
      switch (level) {
        case LEVEL_VALUES.DEBUG:
          messages = Array.prototype.slice.call(messageArguments)
          console.log(Log.formatMessage(logger, LEVEL_TEXTS.DEBUG, method, messages))
          break
        case LEVEL_VALUES.INFO:
          messages = Array.prototype.slice.call(messageArguments)
          console.log(Log.formatMessage(logger, LEVEL_TEXTS.INFO, method, messages))
          break
        case LEVEL_VALUES.WARN:
          messages = Array.prototype.slice.call(messageArguments)
          console.warn(Log.formatMessage(logger, LEVEL_TEXTS.WARN, method, messages))
          break
        case LEVEL_VALUES.ERROR:
          messages = Array.prototype.slice.call(messageArguments)
          console.error(Log.formatMessage(logger, LEVEL_TEXTS.ERROR, method, messages))
          break
        case LEVEL_VALUES.OFF:
          break
      }
    }
  }

  static formatMessage (logger, level, method, messages) {
    let concatMessage = ''

    if (messages !== undefined && messages !== null) {
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const type = Log.getType(message)
        let messagePart = ''

        switch (type) {
          case 'array':
            messagePart = '[Array] ' + message.toString()
            break
          case 'object':
            messagePart = '[JSON] ' + JSON.stringify(message)
            break
          case 'other':
            try {
              if (typeof message === 'undefined') {
                messagePart = '[undefined]'
              } else {
                const messageToDisplay = JSON.stringify(message)
                if (messageToDisplay === undefined) {
                  messagePart = '[Other] ' + message.toString()
                } else {
                  messagePart = '[Other] ' + messageToDisplay
                }
              }
            } catch (error) {
              if (message !== undefined && message !== null && (message.toString !== undefined || message.toString !== null)) {
                messagePart = '[Other] ' + message.toString()
              } else {
                messagePart = '[Other] <non stringifyable object>'
              }
            }

            break
          default:
            if (message === undefined) {
              messagePart = 'undefined'
            } else if (message === null) {
              messagePart = 'null'
            } else {
              messagePart = message
            }
            break
        }

        if (concatMessage.length === 0) {
          concatMessage += messagePart
        } else {
          concatMessage += ', ' + messagePart
        }
      }
    }

    let loggerString = ''
    if (defaultLevel < 4) {
      if (logger.length > loggerLength) {
        loggerString = logger.substr(logger.length - loggerLength)
      } else {
        loggerString = logger.padStart(loggerLength, ' ')
      }
    } else {
      loggerString = logger
    }

    const levelString = level.padEnd(5, ' ')

    let methodString = ''
    if (method !== null) {
      methodString = ' (@' + method + ')'
    }

    return '[PM] [' + levelString + '] ' + loggerString + ': ' + concatMessage + methodString
  }

  static getType (element) {
    if (Array.isArray(element)) return 'array'
    else if (typeof element === 'string') return 'string'
    else if (element !== null && typeof p === 'object') return 'object'
    else return 'other'
  }

  static getStackTrace () {
    let error = new Error()
    return error.stack
  }
}
