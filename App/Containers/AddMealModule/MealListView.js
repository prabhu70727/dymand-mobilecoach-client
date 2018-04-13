import React, {Component} from 'react'
import {View, Text} from 'react-native'
import PropTypes from 'prop-types'
import Colors from '../../Themes/Colors'
import I18n from '../../I18n/I18n'
import {connect} from 'react-redux'
import moment from 'moment'
import Button from 'react-native-button'
import { Icon } from 'react-native-elements'
import { getNonEditableDays } from '../../Redux/Selectors'
import {getBaseUnit} from './FoodMetrics'
import * as Animatable from 'react-native-animatable'

class MealListView extends Component {
  static propTypes = {
    meal: PropTypes.object,
    onDeleteFood: PropTypes.func,
    onDeleteMeal: PropTypes.func,
    fadeInFood: PropTypes.bool,
    fadeInTitle: PropTypes.bool
  }

  renderFood () {
    let id = 0
    if (this.props.meal.food.length === 0) {
      return (
        <View style={[styles.foodContainer, {borderBottomWidth: 0}]} key={id++}>
          <Text style={styles.foodTitle}>{I18n.t('FoodDiary.emptyNotice2')}</Text>
        </View>
      )
    } else {
      return this.props.meal.food.map((food) =>
        <Animatable.View duration={550} animation={this.props.fadeInFood ? 'fadeIn' : null} style={styles.foodContainer} key={id++}>
          <Text numberOfLines={2} style={[styles.foodTitle, this.props.onDeleteFood ? {marginRight: 40} : null]}>{food.foodnameDE}</Text>
          <Text style={styles.foodAmountAndUnit}>{this.formatAmountAndUnit(food)}</Text>
          {this.renderDeleteFoodButton(food)}
        </Animatable.View>
      )
    }
  }

  formatAmountAndUnit (food) {
    const {selectedAmount, calculatedGram} = food
    let result = parseFloat(selectedAmount.value.toFixed(2)) + ' ' + I18n.t('FoodUnits.' + selectedAmount.unit.unitId)
    // If the user didn't select a base-unit (g, ml), also add the equivalent getBaseUnit-Value
    if (![0, 1].includes(selectedAmount.unit.unitId)) result = result + ' / ' + calculatedGram + ' ' + getBaseUnit(food)
    // TODO: this is only a temporary fix to keep compatibilty with current version (can be deleted later)
    if (result.includes('undefined')) return parseFloat(selectedAmount.value.toFixed(2)) + ' ' + selectedAmount.unit + ' / ' + calculatedGram + ' ' + getBaseUnit(food)
    else return result
  }

  renderDeleteFoodButton (food) {
    if (this.props.onDeleteFood) {
      return (
        <Button
          activeOpacity={0.5}
          containerStyle={styles.deleteButton}
          onPress={() => this.props.onDeleteFood(food)} >
          <Icon name='delete-forever' type='MaterialIcons' size={30} color={Colors.messageBubbles.right.background} />
        </Button>
      )
    } else return null
  }

  renderDeleteMealButton (meal) {
    if (this.props.onDeleteMeal && !this.props.nonEditableDays.includes(meal.mealDate)) {
      return (
        <Button
          activeOpacity={0.5}
          containerStyle={styles.deleteButton}
          onPress={() => this.props.onDeleteMeal(meal)} >
          <Icon name='delete-forever' type='MaterialIcons' size={30} color={'white'} />
        </Button>
      )
    } else return null
  }

  renderMealTitle () {
    const { meal } = this.props
    if (meal.mealType && meal.mealTime) {
      let m = moment(meal.mealTime)
      return (
        <View style={styles.headlineContainer}>
          <Animatable.Text duration={550} animation={this.props.fadeInTitle ? 'fadeIn' : null} style={styles.headline}>
            {I18n.t('FoodDiary.' +
            meal.mealType) + ' (' +
            I18n.t('FoodDiary.' +
            // \u00a0 = non breaking space
            meal.mealPlace).replace(' ', '\u00a0') + ',\u00a0' +
            m.format('HH:mm') + ')'}
          </Animatable.Text>
          {this.renderDeleteMealButton(meal)}
        </View>
      )
    } else return <View style={styles.headlineContainer} />
  }

  render () {
    return (
      <View style={styles.containerView}>
        {this.renderMealTitle()}
        {this.renderFood()}
      </View>
    )
  }
}

const styles = {
  headline: {
    padding: 15,
    paddingRight: 20,
    marginRight: 50,
    paddingLeft: 20,
    fontSize: 16,
    color: Colors.messageBubbles.right.text
  },
  headlineContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
    minHeight: 50,
    backgroundColor: Colors.messageBubbles.right.background,
    justifyContent: 'space-between'
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    padding: 10
  },
  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  foodTitle: {
    marginTop: 10,
    marginBottom: 5,
    flex: 1,
    fontSize: 16,
    color: Colors.main.grey1
  },
  bullet: {
    paddingRight: 10,
    fontSize: 20,
    color: Colors.main.grey1
  },
  foodContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    justifyContent: 'center',
    borderColor: '#C3CDD4',
    paddingTop: 5,
    paddingBottom: 5
  },
  foodAmountAndUnit: {
    fontSize: 14,
    color: Colors.main.grey2,
    fontStyle: 'italic',
    paddingBottom: 10
  }
}

const mapStateToProps = (state) => {
  return {
    nonEditableDays: getNonEditableDays(state)
  }
}

export default connect(mapStateToProps)(MealListView)
