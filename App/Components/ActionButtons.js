import React from 'react'
import PropTypes from 'prop-types'
import BlurView from '../Components/BlurView'
import Icon from 'react-native-vector-icons/Ionicons'
import Styles, {ActionButtonStyle} from './Styles/ActionButtonsStyles'
import ActionButton from 'react-native-action-button'
import { HTMLMARKUP } from '../Fixtures/ChatMessages'

export default function ActionButtons ({showModal, setRenderInputBar}) {
  return (
    <ActionButton buttonColor={ActionButtonStyle.mainButton.buttonColor} backdrop={<BlurView />} onPress={() => setRenderInputBar(false)}>
      <ActionButton.Item buttonColor={ActionButtonStyle.button1.buttonColor} title='Add Meal' onPress={() => {
        showModal('add-meal-prestep', {showModal})
      }}>
        <Icon name='ios-nutrition' style={Styles.actionButtonIcon} />
      </ActionButton.Item>
      <ActionButton.Item buttonColor={ActionButtonStyle.button2.buttonColor} title='Open keyboard' onPress={() => { setRenderInputBar(true) }}>
        <Icon name='ios-text' style={Styles.actionButtonIcon} />
      </ActionButton.Item>
      <ActionButton.Item buttonColor={ActionButtonStyle.button3.buttonColor} title='Show rich text modal' onPress={() => {
        showModal('rich-text', {htmlMarkup: HTMLMARKUP})
      }}>
        <Icon name='ios-game-controller-b' style={Styles.actionButtonIcon} />
      </ActionButton.Item>
      <ActionButton.Item buttonColor={ActionButtonStyle.button3.buttonColor} title='Insert Message' onPress={() => { showModal('insert-message') }}>
        <Icon name='ios-game-controller-b' style={Styles.actionButtonIcon} />
      </ActionButton.Item>
      <ActionButton.Item buttonColor={ActionButtonStyle.button3.buttonColor} title='Start Demo Dialogue' onPress={() => { showModal('info-text-dialogue') }}>
        <Icon name='ios-text' style={Styles.actionButtonIcon} />
      </ActionButton.Item>
    </ActionButton>
  )
}

ActionButtons.propTypes = {
  showModal: PropTypes.func.isRequired,
  setRenderInputBar: PropTypes.func.isRequired
}
