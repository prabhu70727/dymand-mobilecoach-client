import { DOMParser } from 'react-native-html-parser'
import {ImageCacheManager} from 'react-native-cached-image'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'

import Log from './Log'
const log = new Log('Utils/Common')

const imageCacheManager = ImageCacheManager()
// Time to live for local file: 10 years (since they don't change!)
const TTL = 10 * 365 * 24 * 3600

const convertUriToFilePath = function (uri) {
  let path = uri
  if (path.startsWith('file://')) path = path.substring(7)
  return path
}

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

  // Props:
  // localUri (String): Uri to local file (e.g. "file:///Users/.../0686F395-7B29-47E7-897C-205AEE5ECEEE.jpg")
  // remoteUri (String): related remoteUri (e.g. "https://dv01.pathmate.cloud/PMCP/files/...mcGTaozgZncXBYiVVVYzcZp")
  // cacheThumbnail (bool): whether or not a thumbnail (500x500px) should be created as well. ONLY SUITABLE FOR IMAGE FILES!
  static cacheLocalMedia (remoteUri, localUri = '', cacheThumbnail) {
    return new Promise((resolve, reject) => {
      // Copy local file to cache folder and cache it related to remote url
      imageCacheManager.seedAndCacheUrl(remoteUri, convertUriToFilePath(localUri), {ttl: TTL}).then((filepath) => {
        log.info('Caching local image file for remote url: ' + remoteUri)
        // TODO: delete local file
        // for image files, also cache url with '/500/500/false/false'-suffix, so client doesn't need to fetch any remote file
        if (cacheThumbnail) {
          // Create thumbnail locally, parameters: Source-Path, maxWidth, maxHeight, format, quality (0-100), rotation outputPath
          ImageResizer.createResizedImage(localUri, 500, 500, 'JPEG', 60, 0, 'compressed').then((response) => {
            // cache thumbnail as wel...
            log.info('Creating thumbnail for local image with remote url: ' + remoteUri)
            imageCacheManager.seedAndCacheUrl(remoteUri + '/500/500/false/false', response.path).then(() => {
              log.info('Caching thumbnail as well with thbumnail suffix: /500/500/false/false')
              resolve(filepath)
            }).catch((e) => {
              log.warn('Error caching thumbnail: ' + e.toString())
              reject(e)
            })
          }).catch((e) => {
            log.warn('Error creating thumbnail: ' + e.toString())
            reject(e)
          })
        // for all other files, just cache answer-message directly
        } else {
          resolve(filepath)
        }
      // If any errors occure while caching, still send the message without any caching
      }).catch((e) => {
        log.warn(`Could not cache local file: ${localUri} for remote url: ${remoteUri}. Error: ${e.toString()}`)
        reject(e)
      })
    })
  }

  static deleteLocalFile (filePath) {
    return RNFS.unlink(filePath)
  }

  static getImageCacheManager () {
    return imageCacheManager
  }
}
