import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ViewPropTypes,
  Linking
 } from 'react-native'
import PropTypes from 'prop-types'
import ParsedText from 'react-native-parsed-text'

import ChatImage from './ChatImage'
import ChatVideo from './ChatVideo'
import PlayAudioFile from './PlayAudioFile'

import Log from '../../Utils/Log'
const log = new Log('CustomMessages/PMMessageText')

const URL_PATTERN = /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i
const WWW_URL_PATTERN = /^www\./i
const MARKDOWN_URL_PATTERN = /\[(.+?)\]\(.+?\)/i
const CONTENT_TYPES = {IMAGE: 'image', VIDEO: 'video', AUDIO: 'audio'}

export default class PMMessageText extends Component {
  static propTypes = {
    showModal: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    currentMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style
    }),
    textStyle: PropTypes.shape({
      left: Text.propTypes.style,
      right: Text.propTypes.style
    }),
    linkStyle: PropTypes.shape({
      left: Text.propTypes.style,
      right: Text.propTypes.style
    }),
    textProps: PropTypes.object,
    customTextStyle: Text.propTypes.style,
    parsePatterns: PropTypes.array
  }

  static defaultProps = {
    position: 'left',
    currentMessage: {
      text: ''
    },
    containerStyle: {},
    textStyle: {},
    linkStyle: {},
    parsePatterns: []
  }

  static contextTypes = {
    actionSheet: PropTypes.func
  }

  renderText (text) {
    if (!text) {
      if (text === '') return null
      else text = this.props.currentMessage.text
    }
    const linkStyle = StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle])

    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        <ParsedText
          style={[styles[this.props.position].text, this.props.textStyle[this.props.position], this.props.customTextStyle]}
          parse={[
            // Markdown URLs
            {pattern: MARKDOWN_URL_PATTERN, style: linkStyle, onPress: this.onUrlPress, renderText: this.renderMarkdownUrl},
            // URLs
            {pattern: URL_PATTERN, style: linkStyle, onPress: this.onUrlPress},
            // Linked Survey
            {pattern: /####LINKED_SURVEY####/, style: linkStyle, onPress: () => this.onUrlPress(this.props.currentMessage.custom.linkedSurvey), renderText: this.replaceSurveyPlaceholder}
          ].concat(this.props.parsePatterns)}
          childrenProps={{...this.props.textProps}}
          renderText={this.replaceText}
        >
          {text}
        </ParsedText>
      </View>
    )
  }

  renderMarkdownUrl (matchingString) {
    // matches => ["[@michel:5455345]", "@michel", "5455345"]
    let pattern = /\[(.+)\]/i
    let result = ''
    let matches = matchingString.match(pattern)
    if (matches && matches[1]) result = matches[1]
    return (
      <Text>{result}</Text>
    )
  }

  replaceSurveyPlaceholder (matchingString, matches) {
    // matches => ["[@michel:5455345]", "@michel", "5455345"]
    // let pattern = /####LINKED_SURVEY####/
    // let match = matchingString.match(pattern)
    return (
      <Text>Linked Survey</Text>
    )
  }

  onUrlPress (url) {
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    let cleanedUrl = url
    // first, "clean" urls
    if (WWW_URL_PATTERN.test(cleanedUrl)) {
      cleanedUrl = `http://${cleanedUrl}`
    }
    // extract markdown URLS
    if (MARKDOWN_URL_PATTERN.test(cleanedUrl)) {
      let matches = cleanedUrl.match(/\((.+)\)/)
      // If Markdown pattern was found, there should always be a match!
      // Double check for stability..
      if (matches[1]) cleanedUrl = matches[1]
    }
    // Then open URL
    Linking.canOpenURL(cleanedUrl).then((supported) => {
      if (!supported) {
        log.warn('No handler for URL:', cleanedUrl)
      } else {
        Linking.openURL(cleanedUrl)
      }
    })
  }

  renderMediaText (renderMedia = () => null) {
    const {text} = this.props.currentMessage
    const {mediaType} = this.props.currentMessage.custom
    let subTexts = text.split('####LINKED_MEDIA_OBJECT####')
    return (
      subTexts.map((subText, index) => {
        // if its the last subText, just render the text
        if (index === subTexts.length - 1) {
          return (
            <View key={index}>
              {this.renderText(subText)}
            </View>
          )
        } else {
          return (
            <View key={index} style={mediaType !== 'audio' ? styles.mediaTextVisual : styles.mediaTextAudio}>
              {this.renderText(subText)}
              {renderMedia()}
            </View>
          )
        }
      })
    )
  }

  render () {
    const { currentMessage } = this.props
    if (currentMessage.text) {
      // Check if the message contains media
      if (currentMessage.custom.linkedMedia && currentMessage.text.includes('####LINKED_MEDIA_OBJECT####')) {
        // Check content-type of media and render accordingly
        log.debug('Rendering media type', currentMessage.custom.mediaType)
        switch (currentMessage.custom.mediaType) {
          case CONTENT_TYPES.IMAGE:
            return (
              <View>
                {this.renderMediaText(this.renderImage)}
              </View>
            )
          case CONTENT_TYPES.VIDEO:
            return (
              <View>
                {this.renderMediaText(this.renderVideo)}
              </View>
            )
          case CONTENT_TYPES.AUDIO:
            return (
              <View>
                {this.renderMediaText(this.renderAudio)}
              </View>
            )
          // Fallback-Strategy: If there is a linked-Media-Object, but the contentType is unknown, just render the URL as a link-text.
          default:
            log.warn('Unknown contentType', currentMessage.custom.mediaType, 'found for linkedMedia-url: ', currentMessage.custom.linkedMedia)
            return (
              this.renderText(currentMessage.text.replace('####LINKED_MEDIA_OBJECT####', currentMessage.custom.linkedMedia))
            )
        }
      } else return this.renderText()
    }
  }

  renderImage = () => {
    return <ChatImage
      source={this.props.currentMessage.custom.linkedMedia}
      showModal={(component, content, onClose) => this.props.showModal(component, content, onClose)}
      position={this.props.position}
    />
  }

  renderVideo = () => {
    return <ChatVideo
      source={this.props.currentMessage.custom.linkedMedia}
      showModal={(component, content, onClose) => this.props.showModal(component, content, onClose)}
      position={this.props.position}
    />
  }

  renderAudio = () => {
    return (
      <PlayAudioFile
        source={this.props.currentMessage.custom.linkedMedia}
        position={this.props.position}
      />
    )
  }
}

const textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10
}

const styles = {
  left: StyleSheet.create({
    text: {
      color: 'black',
      paddingTop: 5,
      ...textStyle
    },
    link: {
      textDecorationLine: 'underline'
    }
  }),
  right: StyleSheet.create({
    text: {
      color: 'white',
      paddingTop: 5,
      ...textStyle
    },
    link: {
      textDecorationLine: 'underline'
    }
  }),
  mediaTextVisual: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  mediaTextAudio: {
  }
}
