import React, { Component } from 'react'
import { View, Alert, Platform } from 'react-native'
import { GiftedChat, LoadEarlier, Message } from 'react-native-gifted-chat'
import PMNavigationBar from '../../Components/Navbar'
import ConnectionStateButton from '../../Components/ConnectionStateButton'
import { addNavigationHelpers } from 'react-navigation'
import { ImageCacheProvider } from 'react-native-cached-image'
// Actions
import ServerMessageActions from './../../Redux/MessageRedux'
import StoryProgressActions from '../../Redux/StoryProgressRedux'
import GUIActions from '../../Redux/GUIRedux'
import GiftedChatMessageActions from '../../Redux/GiftedChatMessageRedux'
// Helpers
import I18n from '../../I18n/I18n'
import {connect} from 'react-redux'
import KeyboardSpacer from 'react-native-keyboard-spacer'

// Components
// TODO: Create index.js of components to be able to import directly from directory
import SelectOneButton from '../../Components/CustomMessages/SelectOneButton'
import RepeatingBackgroundImage from '../../Components/RepeatingBackgroundImage'
import PMMessageText from '../../Components/CustomMessages/PMMessageText'
import AddMealActionButton from '../AddMealModule/AddMealActionButton'
import OpenComponent from '../../Components/CustomMessages/OpenComponent'
import TextOrNumberInputBubble from '../../Components/CustomMessages/TextOrNumberInputBubble'
import DateInput from '../../Components/CustomMessages/DateInput'
import Likert from '../../Components/CustomMessages/Likert'
import LikertSlider from '../../Components/CustomMessages/LikertSlider'
import EmptyChatIndicator from '../../Components/EmptyChatIndicator'
import TypingIndicator from '../../Components/CustomMessages/TypingIndicator'
import OfflineStatusIndicator from '../../Components/CustomMessages/OfflineStatusIndicator'
import Ticks from '../../Components/CustomMessages/Ticks'
import SelectManyComponent from '../../Components/CustomMessages/SelectManyComponent'
import PMTextBubble from '../../Components/CustomMessages/PMTextBubble'
import BlankMessage from '../../Components/CustomMessages/BlankMessage'
import BlankBubble from '../../Components/CustomMessages/BlankBubble'
// Config
import AppConfig from '../../Config/AppConfig'
// Styles & Themes
import Styles, { TextBubbleStyle } from './Styles'
import {Images} from '../../Themes'
// Redux
import {ConnectionStates} from '../../Redux/ServerSyncRedux'
// Bug: This is needed for localizing the dates. See https://github.com/FaridSafi/react-native-gifted-chat/issues/614
import 'moment/locale/de'

import Log from '../../Utils/Log'
const log = new Log('Chat')

const getVisibleMessages = (messages) => {
  const messagesArray = Object.values(messages).reverse()
  return messagesArray.filter(message => message.custom.visible && !message.custom.sticky)
}

const getStickyMessages = (messages) => {
  const messagesArray = Object.values(messages).reverse()
  return messagesArray.filter(message => message.custom.visible && message.custom.sticky)
}

class Chat extends Component {
  constructor (props) {
    super(props)
    this.state = {
      renderInputBar: false
    }
    this.renderCustomView = this.renderCustomView.bind(this)
    this.renderBubble = this.renderBubble.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.renderLoadEarlier = this.renderLoadEarlier.bind(this)
    this.showModal = this.showModal.bind(this)

    // If there are still visited-screens in storyProgress-Redux (e.g. user visited screen and left app before returning to chat), send visited-screen intention now!
    const {visitedScreens} = props.storyProgress
    if (visitedScreens.length > 0) {
      visitedScreens.forEach(screen => {
        this.props.sendIntention(null, screen + '-opened', null)
      })
      // clear visited screens again
      this.props.resetVisitedScreens()
    }
  }

  componentDidMount () {
    // clear Unread-Messages badge
    this.props.clearUnreadMessages()
  }

  getChatProperties = () => {
    return ({
      // general configuration (Locale, Time, user, etc.)
      locale: I18n.locale,
      timeFormat: 'LT',
      dateFormat: 'LL',
      minInputToolbarHeight: 0,
      user: {_id: 1},
      onLongPress: () => { return null },
      onPressAvatar: () => { this.showModal('image-lightbox', {source: Images.coaches[this.props.coach]}) },
      keyboardShouldPersistTaps: 'always',
      renderAvatarOnTop: true,
      // Source of messages to display
      messages: this.props.messages,
      // Custom Render Methods to override default renders
      // 1. Messages -> Container for Chat-Bubbles
      renderMessage: this.renderMessage,
      // 2. Chat-Bubbles
      renderBubble: this.renderBubble,
      // 3. Message-Text inside Chat-Bubbles
      renderMessageText: this.renderMessageText,
      // 4. Custom Views: Custom Messages, e.g. OpenComponent (determined by 'currentMessage.type')
      renderCustomView: this.renderCustomView,
      // Render-Methods for various other components
      loadEarlier: this.props.guistate.showLoadEarlier,
      onLoadEarlier: this.props.loadEarlier,
      renderFooter: this.renderFooter,
      renderLoadEarlier: this.renderLoadEarlier,
      renderTicks: this.renderTicks,
      showModal: this.showModal,
      // No input-bar for now
      renderInputToolbar: () => null

      // Settings we dont need right now, but still might be helpful for some usecases
      // (Check default props: https://github.com/FaridSafi/react-native-gifted-chat/blob/dda1f9db5c962efb458518a9c8a2803aa37bd959/src/GiftedChat.js)

      // Can be used to display an activity indicator while loading earlier messages
      // isLoadingEarlier: this.props.isLoadingEarlier,

      // No input toolbar for now (Only relevant with input toolbar)
      // placeholder: I18n.t('Chat.placeholder'),
      // label: I18n.t('Chat.send'),

      // OnSend: Callback when user sends a message (not relevant because no input)
      // onSend: (messages) => this.onSend(messages)

      // We don't need this now because we use own Action Button Component
      // renderActions: this.renderCustomActions,
      // renderComposer: () => null
    })
  }

  renderMessage (props) {
    const {currentMessage} = props
    // render unanswered questions as textbubble
    if (currentMessage.custom && currentMessage.custom.unanswered) {
      let unansweredMessage = {
        ...currentMessage,
        type: 'text',
        text: I18n.t('Common.answerExpired'),
        user: {...currentMessage.user, _id: 1}
      }
      return <Message {...props} currentMessage={unansweredMessage} />
    }

    switch (currentMessage.type) {
      case 'select-one-button':
      case 'open-component':
      case 'select-many':
      case 'likert':
      case 'likert-silent':
      case 'likert-slider':
      case 'likert-silent-slider':
      case 'free-text':
      case 'free-numbers':
      case 'date-input':
        // Blank Message = no Avatar or Date are displayed
        return <BlankMessage {...props} />
      default:
        return <Message {...props} />
    }
  }

  renderBubble (props) {
    // return (
    //   <ChatBubble {...props} coach={this.props.coach} />
    // )
    const {currentMessage} = props
    const avatar = Images.coaches[this.props.coach]
    currentMessage.user['name'] = I18n.t('Coaches.' + this.props.coach)
    currentMessage.user['avatar'] = avatar

    // render unanswered questions as textbubble
    if (currentMessage.custom && currentMessage.custom.unanswered) {
      let unansweredMessage = {
        ...currentMessage,
        type: 'text',
        text: I18n.t('Common.answerExpired'),
        user: {...currentMessage.user, _id: 1}
      }
      return (
        <PMTextBubble
          chatProps={{...props, currentMessage: unansweredMessage}}
          wrapperStyle={TextBubbleStyle.wrapperStyle}
          textStyle={{left: {...TextBubbleStyle.textStyle.left, fontStyle: 'italic'}, right: {...TextBubbleStyle.textStyle.right, fontStyle: 'italic'}}}
        />
      )
    }

    switch (currentMessage.type) {
      case 'image-message':
      case 'text':
      case 'intention':
        return this.renderTextBubble(props)
      case 'select-one-button':
      case 'open-component':
      case 'select-many':
      case 'likert':
      case 'likert-silent':
      case 'likert-slider':
      case 'likert-silent-slider':
      case 'free-text':
      case 'free-numbers':
      case 'date-input':
        return this.renderBlankBubble(props)
      default:
        return null
    }
  }

  renderTextBubble (props) {
    return (
      <PMTextBubble
        chatProps={props}
        wrapperStyle={TextBubbleStyle.wrapperStyle}
        textStyle={TextBubbleStyle.textStyle}
        appearInAnimationLeft='bounceIn'
      />
    )
  }

  renderCustomView (props) {
    // const {currentMessage} = props
    // return (
    //   <CustomView message={currentMessage} />
    // )
    // // )
    const {currentMessage} = props
    switch (currentMessage.type) {
      case 'intention':
      case 'text':
        return null
      case 'select-one-button':
        return this.renderSelectButton(props)
      case 'select-many':
        return this.renderSelectManyButton(props)
      case 'open-component':
        return this.renderOpenComponent(props)
      case 'likert':
      case 'likert-silent':
        return this.renderLikert(props)
      case 'likert-slider':
      case 'likert-silent-slider':
        return this.renderLikertSlider(props)
      case 'free-text':
      case 'free-numbers':
        return this.renderTextOrNumberInputBubble(props)
      case 'date-input':
        return this.renderDateInput(props)
      default:
        return null
    }
  }

  renderBlankBubble (props) {
    return (
      <BlankBubble {...props} />
    )
  }

  renderSelectButton (props) {
    // suitable fadeIn Animations: bounceInRight, fadeInRight, fadeInUp, zoomInRight
    return (
      <SelectOneButton
        onPress={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='fadeInRight'
        fadeOutAnimation='fadeOutRight'
        fadeOutSelectedAnimation='bounceOut'
        duration={350}
        delayOffset={100}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderSelectManyButton (props) {
    return (
      <SelectManyComponent
        onPress={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='fadeInRight'
        duration={350}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderTextOrNumberInputBubble (props) {
    return (
      <TextOrNumberInputBubble
        onSubmit={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='fadeInRight'
        duration={350}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderDateInput (props) {
    return (
      <DateInput
        onSubmit={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='fadeInRight'
        duration={350}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderLikert (props) {
    return (
      <Likert
        onPress={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='flipInX'
        duration={350}
        delayOffset={100}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderLikertSlider (props) {
    return (
      <LikertSlider
        onSubmit={(intention, text, value, relatedMessageId) => this.answerAction(intention, text, value, relatedMessageId)}
        currentMessage={props.currentMessage}
        fadeInAnimation='fadeInRight'
        duration={350}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
      />
    )
  }

  renderOpenComponent (props) {
    return (
      <OpenComponent
        onPress={() => this.openComponent(props.currentMessage)}
        currentMessage={props.currentMessage}
        fadeInAnimation='flipInX'
        duration={350}
        setAnimationShown={(id) => this.props.markAnimationAsShown(id)}
        icon={props.currentMessage.text.startsWith('show-backpack-info') ? 'info-with-circle' : undefined}
        iconType={props.currentMessage.text.startsWith('show-backpack-info') ? 'entypo' : undefined}
      />
    )
  }

  renderMessageText (props) {
    return (
      <PMMessageText
        {...props}
        linkStyle={TextBubbleStyle.textStyle.link}
        currentMessage={props.currentMessage}
        onPress={() => this.openComponent({custom: {component: 'progress'}})}
      />
    )
  }

  renderTicks (currentMessage) {
    return <Ticks currentMessage={currentMessage} />
  }

  renderNavigationbar (props) {
    const {coach, connectionState} = props
    let title = I18n.t('Chat.title', {coach: I18n.t('Coaches.' + coach)})
    return (
      <PMNavigationBar
        title={title}
        rightButton={
          <ConnectionStateButton
            onPress={() => { this.showConnectionStateMessage(connectionState) }}
            connectionState={connectionState}
            />}
        props={props} />
    )
  }

  renderLoadEarlier = (props) => {
    return (
      <LoadEarlier {...props} label={I18n.t('Chat.loadEarlier')} containerStyle={{marginTop: 20}} />
    )
  }

  /* Parameters:
   * intention: string to distinguish between diffrent kind of actions
   *            to fire when the user selects one option
   *            (in most cases this will be to send a answer message to the server)
   * payload:   Object which contains any kind of data we might need from our original message object
   */
  answerAction (intention, text, value, relatedMessageId) {
    switch (intention) {
      case 'answer-to-server-invisible': {
        // Send the textmessage to server
        this.props.sendInvisibleMessageToServer(value, relatedMessageId)
        break
      }
      case 'answer-to-server-visible': {
        // Send the textmessage to server
        this.props.sendMessageToServer(text, value, relatedMessageId)
        break
      }
      default: {
        log.warn('No answer-action found for intentention of type: ' + intention + ' relatedMessageId (if set): ' + relatedMessageId)
        break
      }
    }
  }

  notifyServer (component, currentMessage = null) {
    switch (component) {
      case 'rich-text': {
        if (currentMessage.custom.infoId) {
          let intention = 'info-' + currentMessage.custom.infoId + '-closed'
          this.props.sendIntention(null, intention, null)
        } else log.warn('Cannot send info-openend-notification for message: ' + currentMessage.text + ', because info-id is undefined.')
        break
      }
      case 'web-closed': {
        log.debug('Web closed sent')
        this.props.sendIntention(null, 'web-closed', null)
        break
      }
      case 'web-completed': {
        let relatedMessageId = currentMessage._id.substring(0, currentMessage._id.lastIndexOf('-'))
        // this.props.sendIntention(null, 'web-closed', null)
        log.debug('Web closed and completed sent for message', relatedMessageId)
        this.props.markMessageAsDisabled(relatedMessageId)
        this.props.sendIntention(null, 'web-closed', null)
        this.props.sendIntention(null, 'web-completed', null)
        break
      }
    }
  }

  // This function determines for each component type (e.g. set Rich Component) the
  // corresponding "openComponent"-Function (= Function which is called when user presses the openComponent Button)
  openComponent (currentMessage) {
    const { showModal } = this.props.screenProps
    const { component, content } = currentMessage.custom
    const navigation = addNavigationHelpers({
      dispatch: this.props.navigation.dispatch,
      state: this.props.nav
    })
    // Component specific Logic (e.g. show Modal)
    switch (component) {
      case 'rich-text': {
        let onClose = () => { this.notifyServer(component, currentMessage) }
        showModal(component, {htmlMarkup: content}, onClose)
        break
      }
      case 'web': {
        let onClose = (completed) => {
          if (completed) this.notifyServer('web-completed', currentMessage)
          else this.notifyServer('web-closed')
        }
        showModal(component, {url: content}, onClose)
        break
      }
      case 'progress': {
        showModal(component)
        break
      }
      case 'tour': {
        navigation.navigate('Tour')
        // remember that user visited that scree for intentions
        this.props.visitScreen('tour')
        break
      }
      case 'backpack': {
        navigation.navigate('Backpack')
        // remember that user visited that scree for intentions
        this.props.visitScreen('backpack')
        break
      }
      case 'diary': {
        navigation.navigate('FoodDiary')
        // remember that user visited that scree for intentions
        this.props.visitScreen('diary')
        break
      }
      case 'pyramid': {
        const navigation = addNavigationHelpers({
          dispatch: this.props.navigation.dispatch,
          state: this.props.nav
        })
        navigation.navigate('FoodDiary', {initialTab: 1})
        // remember that user visited that scree for intentions
        this.props.visitScreen('pyramid')
        break
      }
      default: break
    }
  }

  // This function determines for each component type (e.g. set Rich Component) the
  // corresponding "openComponent"-Function (= Function which is called when user presses the openComponent Button)
  showModal (component, content, onClose) {
    const { showModal } = this.props.screenProps
    showModal(component, content, onClose)
  }

  setRenderInputBar=(value) => {
    this.setState({renderInputBar: value})
  }

  toggleRenderInputBar=() => {
    if (AppConfig.config.dev.allowDebugKeyboard) {
      let value = !this.state.renderInputBar
      this.setState({renderInputBar: value})
    }
  }

  showConnectionStateMessage=(connectionState) => {
    log.action('GUI', 'ConnectionCheck', connectionState)

    let alertMessage = null
    switch (connectionState) {
      case ConnectionStates.INITIALIZING:
      case ConnectionStates.INITIALIZED:
        alertMessage = I18n.t('ConnectionStates.initialized')
        break
      case ConnectionStates.CONNECTING:
      case ConnectionStates.RECONNECTING:
        alertMessage = I18n.t('ConnectionStates.connecting')
        break
      case ConnectionStates.CONNECTED:
      case ConnectionStates.SYNCHRONIZATION:
        alertMessage = I18n.t('ConnectionStates.connected')
        break
      case ConnectionStates.SYNCHRONIZED:
        alertMessage = I18n.t('ConnectionStates.synchronized')
        break
    }

    Alert.alert(
      I18n.t('ConnectionStates.connectionToCoach'),
      alertMessage,
      [
        {text: I18n.t('Common.ok'), onPress: () => true}
      ],
      { cancelable: false }
    )
  }

  renderFooter (props) {
    const { coachIsTyping, currentlyFurtherMessagesExpected } = this.props.guistate
    const { connectionState } = this.props

    let showOfflineStatusMessage = false

    if (!currentlyFurtherMessagesExpected) {
      switch (connectionState) {
        case ConnectionStates.INITIALIZING:
        case ConnectionStates.INITIALIZED:
        case ConnectionStates.CONNECTING:
        case ConnectionStates.RECONNECTING:
        case ConnectionStates.CONNECTED:
          showOfflineStatusMessage = true
          break
        case ConnectionStates.SYNCHRONIZATION:
        case ConnectionStates.SYNCHRONIZED:
          showOfflineStatusMessage = false
          break
      }
    }

    let showTypingIndicator = false
    let showOfflineIndicator = false

    // TODO: unnecessary first condition?
    if ((coachIsTyping && showOfflineStatusMessage) || coachIsTyping) {
      showTypingIndicator = true
    } else if (showOfflineStatusMessage) {
      showOfflineIndicator = true
    }

    return (<View style={Styles.footerContainer}>
      {showTypingIndicator ? <TypingIndicator {...props} /> : null}
      {this.props.stickyMessages.map((message) => {
        return <Message {...this.getChatProperties()} key={message._id} currentMessage={message} />
      })}
      <OfflineStatusIndicator active={showOfflineIndicator} />
      {Platform.OS === 'android' ? <KeyboardSpacer /> : null}
    </View>)
  }

  renderActionButton () {
    if (this.props.storyProgress.actionButtonActive) {
      return (
        <AddMealActionButton
          showModal={this.showModal}
          />
      )
    } else {
      return null
    }
  }

  renderLoadingIndicator () {
    return (
      <EmptyChatIndicator active={this.props.messages.length === 0 && !this.props.guistate.coachIsTyping} emptyChatMessage={AppConfig.config.messages.showEmptyChatMessage ? I18n.t('Chat.emptyChatMessage') : ''} />
    )
  }

  render () {
    return (
      <View style={Styles.chatContainer}>
        <RepeatingBackgroundImage source={Images.chatBg}>
          {this.renderLoadingIndicator()}
          {this.renderNavigationbar(this.props)}
          <GiftedChat {...this.getChatProperties()}>
            <ImageCacheProvider />
          </GiftedChat>
          {this.renderActionButton()}
        </RepeatingBackgroundImage>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    nav: state.nav,
    coach: state.settings.coach,
    messages: getVisibleMessages(state.giftedchatmessages),
    stickyMessages: getStickyMessages(state.giftedchatmessages),
    guistate: state.guistate,
    storyProgress: state.storyProgress,
    connectionState: state.serverSyncStatus.connectionState
  }
}

// TODO: Do we still need messageAnsweredByGiftedChat?
const mapStateToDispatch = dispatch => ({
  sendMessageToServer: (text, value, relatedMessageId = null) => dispatch(ServerMessageActions.sendMessage(text, value, relatedMessageId)),
  sendInvisibleMessageToServer: (value, relatedMessageId = null) => dispatch(ServerMessageActions.sendInvisibleMessage(value, relatedMessageId)),
  sendIntention: (text, intention, content) => dispatch(ServerMessageActions.sendIntention(text, intention, content)),
  loadEarlier: () => dispatch(GUIActions.loadEarlier()),
  messageAnsweredByGiftedChat: (relatedMessageId) => dispatch(ServerMessageActions.messageAnsweredByGiftedChat(relatedMessageId)),
  visitScreen: (visitedScreen) => dispatch(StoryProgressActions.visitScreen(visitedScreen)),
  resetVisitedScreens: () => dispatch(StoryProgressActions.resetVisitedScreens()),
  markMessageAsDisabled: (relatedMessageId) => dispatch(ServerMessageActions.disableMessage(relatedMessageId)),
  markAnimationAsShown: (messageId) => dispatch(GiftedChatMessageActions.setMessageAnimationFlag(messageId, false)),
  clearUnreadMessages: (messageId) => dispatch(GUIActions.clearUnreadMessages())
})

export default connect(mapStateToProps, mapStateToDispatch)(Chat)
