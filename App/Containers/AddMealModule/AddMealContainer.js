import React, {Component} from 'react'
import {View, ScrollView, Text, StyleSheet, Alert} from 'react-native'
import Button from 'react-native-button'
import I18n from '../../I18n/I18n'
import {connect} from 'react-redux'
import R from 'ramda'
import { Icon } from 'react-native-elements'
import {ifIphoneX} from 'react-native-iphone-x-helper'

import {Colors, Metrics} from '../../Themes/'
import AddMealPreStep from './AddMealPreStep'
import MealListView from './MealListView'
import SearchFood from './SearchFood'
import AddFoodStep from './AddFoodStep'
import FoodDiaryActions from '../../Redux/FoodDiaryRedux'
import ServerMessageActions from '../../Redux/MessageRedux'
import RectangleIconButton from '../../Components/RectangleIconButton'
import RecentlyAdded from './RecentlyAdded'
import Categories from './Categories'
import HeaderBar from '../../Components/HeaderBar'
import moment from 'moment'
import ModalContent from '../ModalContent'

import Log from '../../Utils/Log'
const log = new Log('AddMealModule/AddMealContainer')

class AddMealContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      overlay: 'pre-step',
      selectedFood: null,
      meal: {
        mealType: this.props.mealType,
        food: []
      }
    }
  }

  renderCardOverlays () {
    switch (this.state.overlay) {
      case 'pre-step':
        return <AddMealPreStep onDiscard={this.props.onPress} onConfirm={(mealPlace, mealTime) => this.onSubmitPreStep(mealPlace, mealTime)} />
      case 'add-food':
        return <AddFoodStep food={this.state.selectedFood} addFood={(food) => this.onAddFood(food)} onCancel={() => this.closeOverlay()} />
      default:
        return null
    }
  }

  renderFullScreenOverlays () {
    switch (this.state.overlay) {
      case 'recently-added':
        return <RecentlyAdded onSelectFood={(food) => this.onSelectFood(food)} onBack={() => this.closeOverlay()} />
      case 'categories':
        return <Categories onSelectFood={(food) => this.onSelectFood(food)} onBack={() => this.closeOverlay()} />
      case 'search-food':
        return <SearchFood onBack={() => this.closeOverlay()} onSelectFood={(food) => this.onSelectFood(food)} />
      case 'diary-info':
        return <ModalContent onClose={() => this.closeOverlay()} type='rich-text' content={{htmlMarkup: this.props.cachedText['backpack-info-01']}} />
      default:
        return null
    }
  }

  closeOverlay () {
    this.setState({
      overlay: null,
      selectedFood: null
    })
  }

  onSelectFood (food) {
    this.setState({
      overlay: 'add-food',
      selectedFood: food
    })
  }

  onAddFood (food) {
    log.action('Module', 'AddMeal', 'food_added')
    // store in recently added AddFoods
    let foodCopy = R.clone(food)
    // clear amount
    delete foodCopy.amount
    this.props.addRecentlyAdded(foodCopy)
    let newMeal = {...this.state.meal}
    let newFood = [...this.state.meal.food, food]
    newMeal.food = newFood
    this.setState({
      overlay: '',
      selectedFood: null,
      meal: newMeal
    })
  }

  onDeleteFood (food) {
    Alert.alert(
        food.foodnameDE + ' ' + I18n.t('FoodDiary.confirmDelete'),
        '',
      [
        {text: I18n.t('Settings.no'), onPress: () => {}, style: 'cancel'},
        {
          text: I18n.t('Settings.yes'),
          onPress: () => {
            log.info('Removing food from meal: "' + food.foodnameDE)
            log.action('Module', 'AddMeal', 'food_deleted')
            this.deleteFood(food)
          }
        }
      ],
        { cancelable: false }
    )
  }

  deleteFood (food) {
    let newMeal = {...this.state.meal}
    let index = newMeal.food.indexOf(food)
    if (index > -1) {
      newMeal.food.splice(index, 1)
    }

    this.setState({
      overlay: '',
      selectedFood: null,
      meal: newMeal
    })
  }

  onSubmitMeal () {
    log.action('Module', 'AddMeal', 'meal_added')

    const {storyProgress} = this.props
    let meal = R.clone(this.state.meal)
    // create message for server
    let message = I18n.t('FoodDiary.' + meal.mealType) + ':'
    meal.food.forEach((food) => {
      message = message + '\n - ' + food.foodnameDE + ' (' + parseFloat(food.selectedAmount.value.toFixed(2)) + ' ' + I18n.t('FoodUnits.' + food.selectedAmount.unit.unitId) + ')'
    })
    let mealDate = moment(meal['mealTime']).format('DD.MM.YYYY')
    meal['mealDate'] = mealDate
    meal['foodLength'] = meal.food.length

    // if the user is still in tutorial mode, don't store the meal
    if (storyProgress.foodTutorialActive) {
      this.props.sendIntention(message, 'add-meal', meal)
    // If the tutorial is completed, store the meal in fooddiary
    } else {
      // Add meal to local redux store
      this.props.addMeal(meal)
      this.props.sendIntention(message, 'add-meal', meal)
      log.info('New meal (' + meal.mealType + ', ' + meal.mealDate + ') with ' + meal.food.length + ' food-items added to diary.')
    }
    // close addmeal-modal
    this.props.onPress()
  }

  onSubmitPreStep (mealPlace, mealTime) {
    this.setState({
      overlay: '',
      meal: {
        createdAt: new Date(),
        mealType: this.state.meal.mealType,
        mealPlace,
        mealTime,
        food: []
      }
    })
  }

  renderMainContent () {
    // width of rectangle-Icons = screenWidth / 3 - Margins (4x20)
    let iconWidth = (Metrics.screenWidth - 80) / 3
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1, flexDirection: 'column'}}>
          <Button
            containerStyle={styles.searchButtonContainer}
            textStyle={styles.searchButtonText}
            style={styles.searchButton}
            onPress={() => {
              log.action('Module', 'AddMeal', 'freetext_search')
              this.setState({overlay: 'search-food'})
            }}>
            <Icon containerStyle={styles.searchIcon} color={Colors.main.grey2} type='ionicon' name='ios-search' />
            {I18n.t('FoodDiary.searchFood')}
          </Button>
          <View style={styles.rectangleIconContainer}>
            <RectangleIconButton backgroundColor={Colors.buttons.common.background} color={Colors.buttons.common.text} onPress={() => this.setState({overlay: 'diary-info'})} title={I18n.t('FoodDiary.manual')} icon='info' type='entypo' width={iconWidth} />
            <RectangleIconButton backgroundColor={Colors.buttons.common.background} color={Colors.buttons.common.text} onPress={() => {
              log.action('Module', 'AddMeal', 'recently_added')
              this.setState({overlay: 'recently-added'})
            }} title={I18n.t('FoodDiary.recentlyAdded')} icon='ios-bookmarks' type='ionicon' width={iconWidth} />
            <RectangleIconButton backgroundColor={Colors.buttons.common.background} color={Colors.buttons.common.text} onPress={() => {
              log.action('Module', 'AddMeal', 'category_search')
              this.setState({overlay: 'categories'})
            }} title={I18n.t('FoodDiary.categories')} icon='ios-cart' type='ionicon' width={iconWidth} />
          </View>
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>{I18n.t('FoodDiary.yourMeal')}</Text>
          </View>
          <MealListView fadeInFood fadeInTitle meal={this.state.meal} onDeleteFood={(food) => this.onDeleteFood(food)} />
        </ScrollView>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          disabledContainerStyle={styles.buttonDisabled}
          onPress={() => this.onSubmitMeal()}
          disabled={this.state.meal.food.length === 0}>
          <Icon size={45} type='ionicon' name='ios-checkmark' color={'#fff'} iconStyle={{height: 45, marginRight: 5}} />
          {I18n.t('FoodDiary.mealCompleted')}
        </Button>
      </View>
    )
  }

  render () {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        <HeaderBar title={I18n.t('FoodDiary.addMeal')} onClose={this.props.onPress} confirmClose={I18n.t('FoodDiary.confirmClose')} />
        <View style={styles.container}>
          {this.renderMainContent()}
          {this.renderCardOverlays()}
        </View>
        {this.renderFullScreenOverlays()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    fooddiary: state.foodDiary,
    cachedText: state.cachedText,
    storyProgress: state.storyProgress
  }
}

const mapStateToDispatch = dispatch => ({
  addRecentlyAdded: (food) => dispatch(FoodDiaryActions.foodDiaryAddRecentlyAddedFood(food)),
  addMeal: (meal) => dispatch(FoodDiaryActions.foodDiaryAddMeal(meal)),
  sendIntention: (text, intention, content) => dispatch(ServerMessageActions.sendIntention(text, intention, content))
})

export default connect(mapStateToProps, mapStateToDispatch)(AddMealContainer)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: Colors.modal.background,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  rectangleIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 20,
    zIndex: 5
  },
  headline: {
    fontSize: 20,
    color: Colors.main.grey1
  },
  headlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#F8F8F8'
  },
  button: {
    color: '#ffffff'
  },
  buttonContainer: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buttons.common.background,
    ...ifIphoneX({
      height: 65,
      paddingBottom: 15
    })
  },
  buttonDisabled: {
    backgroundColor: Colors.buttons.common.disabled
  },
  searchButton: {
    color: Colors.main.grey2
  },
  searchButtonContainer: {
    padding: 10,
    height: 60,
    borderRadius: 0,
    elevation: 4,
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 0.25
  },
  searchIcon: {
    marginRight: 10
  },
  searchButtonText: {
    fontWeight: '200'
  }
})
