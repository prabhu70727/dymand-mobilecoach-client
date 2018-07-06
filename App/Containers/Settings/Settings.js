
// TODO for improvement check: https://github.com/idibidiart/react-native-responsive-grid/blob/master/UniversalTiles.md

import React, { Component } from 'react'
import { Text, View, StyleSheet, ScrollView, Platform, Share, Alert } from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { connect } from 'react-redux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import { Crashlytics } from 'react-native-fabric'

// import { NavigationActions } from 'react-navigation'
import {Colors} from '../../Themes/'
import PMNavigationBar from '../../Components/Navbar'
import I18n from '../../I18n/I18n'
import { Card } from 'react-native-elements'
import NextButton from '../../Components/NextButton'
import ServerMessageActions from '../../Redux/MessageRedux'
import PDFGenerator from '../../Utils/PDFGenerator'
import AppConfig from '../../Config/AppConfig'

import Log from '../../Utils/Log'
const log = new Log('Containers/Settings/Settings')

class Settings extends Component {
  renderNavigationbar (props) {
    let title = I18n.t('Settings.header')
    return (
      <PMNavigationBar title={title} props={props} rightButton={<View />} />
    )
  }

  onExportDiary () {
    log.info('User started PDFExport')
    log.action('App', 'DiaryExport')
    // const { hideLoadingOverlay, showLoadingOverlay } = this.props.screenProps
    let pdfGenerator = new PDFGenerator()
    pdfGenerator.createPDF(this.props.foodDiary)
  }

  onSendFeedback (name, email, feedback) {
    log.info('User submitted Feedback Form')
    const {wholeState} = this.props
    // convert messages objects to arrays, and shorten them to last 20 messages
    // also filter out send-feedback intention to prevent 'cascadic'-memory leak
    const messagesArray = Object.values(wholeState.messages).slice(-20).filter(message => message['user-intention'] !== 'send-app-feedback')

    const giftedChatMessagesArray = Object.values(wholeState.giftedchatmessages).reverse().slice(-20)
    // Shorten Message Arrays of state to last 20 messages
    const debugState = {
      ...wholeState,
      messages: messagesArray,
      giftedchatmessages: giftedChatMessagesArray
    }
    this.props.sendFeedback({name, email, feedback, state: debugState})
  }

  render () {
    const { openURL } = this.props.screenProps
    return (
      <View style={styles.container}>
        {this.renderNavigationbar(this.props)}
        <ScrollView style={styles.content} indicatorStyle='white'>
          <Card
            title={I18n.t('Settings.personalTitle')}
            titleStyle={styles.cardTitle}
            >
            <View key={1}>
              <NextButton
                styleButton={styles.button}
                styleText={styles.buttonText}
                text={I18n.t('Settings.recommend')}
                onPress={() => {
                  const shareUrl = AppConfig.config[AppConfig.project].shareUrl[I18n.locale.toLowerCase()]
                  // TODO: Update URL
                  Share.share({
                    message: I18n.t('Settings.share.text') + ': ' + shareUrl,
                    url: shareUrl,
                    title: I18n.t('Settings.share.title')
                  }, {
                    // Android only:
                    dialogTitle: I18n.t('Settings.share.title'),
                    // iOS only:
                    excludedActivityTypes: []
                  })
                }}
                />
            </View>
          </Card>

          <Card
            title={I18n.t('Settings.impressumTitle')}
            titleStyle={styles.cardTitle}
            >
            <View key={1}>
              <Text style={[styles.headline, {marginTop: 0}]}>{I18n.t('Settings.impressum.title1')}</Text>
              {/* Use ParsedText to open containing URLS */}
              <ParsedText
                style={styles.paragraph}
                parse={[
                  {type: 'url', style: styles.url, onPress: openURL},
                  {type: 'email', style: styles.url, onPress: (email) => openURL('mailto:' + email)}
                ]}
              >
                {I18n.t('Settings.impressum.copytext1')}
              </ParsedText>
              <Text style={styles.headline}>{I18n.t('Settings.impressum.title2')}</Text>
              <ParsedText
                style={styles.paragraph}
                parse={[{type: 'email', style: styles.url, onPress: (mail) => openURL('mailto:' + mail)}]}
              >
                {I18n.t('Settings.impressum.copytext2')}
              </ParsedText>
              <Text style={styles.headline}>{I18n.t('Settings.impressum.title3')}</Text>
              <Text style={styles.paragraph}>{I18n.t('Settings.impressum.copytext3')}</Text>
              <Text style={styles.headline}>{I18n.t('Settings.impressum.title4')}</Text>
              {/* Use ParsedText to open containing URLS */}
              <ParsedText
                style={styles.paragraph}
                parse={[
                  {type: 'url', style: styles.url, onPress: openURL},
                  {type: 'email', style: styles.url, onPress: openURL}
                ]}
              >
                {I18n.t('Settings.impressum.copytext4')}
              </ParsedText>
            </View>
          </Card>
          <Card
            title='Development'
            titleStyle={styles.cardTitle}
            containerStyle={{marginBottom: 20}}
            >
            <View key={1}>
              <NextButton
                styleButton={styles.button}
                styleText={styles.buttonText}
                text={I18n.t('Settings.debugReport')}
                onPress={() => {
                  log.problem('ProblemState', JSON.stringify(this.props.wholeState))
                  log.error('State reported as incorrect by user!')
                  Alert.alert(
                    'Thank you! 👍',
                    'The app will now stop after selecting "Ok". Please restart the app afterwards, so that the error report can be sent in the background. After that, the app can be used normally again.',
                    [
                      {text: 'Ok',
                        onPress: () => {
                          if (!__DEV__) {
                            Crashlytics.crash()
                          }
                          return true
                        }
                      }
                    ],
                    { cancelable: false }
                  )
                }}
                />
            </View>
          </Card>
          */}
        </ScrollView>
        {(Platform.OS === 'ios') ? <KeyboardSpacer /> : null}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    foodDiary: state.fooddiary,
    wholeState: state
  }
}

const mapStateToDispatch = dispatch => ({
  sendFeedback: (content) => dispatch(ServerMessageActions.sendIntention(null, 'send-app-feedback', content))
})

export default connect(mapStateToProps, mapStateToDispatch)(Settings)

const styles = StyleSheet.create({
  url: {
    color: Colors.buttons.common.background
  },
  headline: {
    color: Colors.main.headline,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  // paragraph: {
  //   fontSize: Fonts.size.small,
  //   color: Colors.main.paragraph
  // },
  container: {
    flex: 1,
    backgroundColor: Colors.main.appBackground
  },
  cardTitle: {
    textAlign: 'left',
    color: Colors.main.headline
  },
  cardText: {
    color: Colors.main.paragraph
  },
  content: {
    flex: 1
  },
  button: {backgroundColor: Colors.buttons.common.background, borderRadius: 20, marginVertical: 10},
  buttonText: {color: Colors.buttons.common.text, fontSize: 16}
})
