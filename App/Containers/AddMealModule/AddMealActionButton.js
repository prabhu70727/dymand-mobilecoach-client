import React, { Component } from 'react'
import {StyleSheet, View} from 'react-native'
import PropTypes from 'prop-types'
import ActionButton from 'react-native-action-button'
import I18n from '../../I18n/I18n'
import {MealTypeArray} from './FoodMetrics'
import BlurView from '../../Components/BlurView'
import {Colors} from '../../Themes'

class AddMealActionButton extends Component {
  static propTypes = {
    showModal: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      resetToken: true
    }
    this.buttonItems = []
    MealTypeArray.forEach((mealType) => {
      // create a real copy of mealtype, otherwise pointer of mealType var will wander...
      let item = (
        <ActionButton.Item
          key={mealType}
          spaceBetween={-50}
          buttonColor={'transparent'}
          title={I18n.t('FoodDiary.' + mealType)}
          onPress={() => { this.props.showModal('add-meal', {mealType}) }}
          textContainerStyle={styles.button}
          textStyle={styles.buttonTitle}
          nativeFeedbackRippleColor={'transparent'}
          hideShadow
        >
          <View style={styles.invisibleIcon} />
        </ActionButton.Item>
      )
      this.buttonItems.push(item)
    })
    // reverse order
    this.buttonItems = this.buttonItems.reverse()
  }

  renderItems () {
    return (
      this.buttonItems.map((item, i) => (
        item
      ))
    )
  }

  render () {
    return (
      <ActionButton
        spacing={-5}
        buttonColor={Colors.buttons.common.background}
        backdrop={<BlurView />}
        fixNativeFeedbackRadius
        resetToken={this.state.resetToken}
        zIndex={100}
        elevation={5}
      >
        {this.renderItems()}
      </ActionButton>
    )
  }
}

export default AddMealActionButton

const styles = StyleSheet.create({
  button: {
    padding: 0,
    top: 0,
    left: 30,
    right: 30,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // IOS shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 0.25,
    // Android shadow
    elevation: 2,
    backgroundColor: Colors.buttons.actionButton.items.background
  },
  buttonTitle: {
    flex: 0,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 17,
    color: Colors.buttons.actionButton.items.text
  },
  invisibleIcon: {
    overflow: 'hidden',
    elevation: 0,
    height: 0,
    opacity: 0
  }
})
