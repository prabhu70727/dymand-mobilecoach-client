import React, { Component } from 'react'
import { StyleSheet, View, Text, ViewPropTypes, Linking } from 'react-native'
import PropTypes from 'prop-types'
import ParsedText from 'react-native-parsed-text'

import ChatImage from './ChatImage'

import Log from '../../Utils/Log'
const log = new Log('Sagas/GiftedChatMessageSaga')

const WWW_URL_PATTERN = /^www\./i

export default class PMMessageText extends Component {
  static propTypes = {
    currentMessage: PropTypes.object,
    showModal: PropTypes.func
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
            ...this.props.parsePatterns(linkStyle, (url) => this.onUrlPress(url)),
            {pattern: /####LINKED_SURVEY####/, style: linkStyle, onPress: () => this.onUrlPress(this.props.currentMessage.custom.linkedSurvey), renderText: this.replaceSurveyPlaceholder}
          ]}
          childrenProps={{...this.props.textProps}}
          renderText={this.replaceText}
        >
          {text}
        </ParsedText>
      </View>
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
    if (WWW_URL_PATTERN.test(url)) {
      this.onUrlPress(`http://${url}`)
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          log.warn('No handler for URL:', url)
        } else {
          Linking.openURL(url)
        }
      })
    }
  }

  renderMediaText () {
    const { text } = this.props.currentMessage
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
            <View key={index} style={{justifyContent: 'center', alignItems: 'center'}}>
              {this.renderText(subText)}
              <ChatImage source={this.props.currentMessage.custom.linkedMedia} showModal={(component, content, onClose) => this.props.showModal(component, content, onClose)} />
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
        return (
          <View>
            {this.renderMediaText()}
          </View>
        )
      } else return this.renderText()
    }
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
  })
}

PMMessageText.contextTypes = {
  actionSheet: PropTypes.func
}

PMMessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: ''
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
  parsePatterns: (linkStyle, onPress) => [
    // URLS:
    {type: 'url', style: linkStyle, onPress}
  ]
}

PMMessageText.propTypes = {
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
  parsePatterns: PropTypes.func,
  textProps: PropTypes.object,
  customTextStyle: Text.propTypes.style
}
