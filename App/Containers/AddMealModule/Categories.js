import React, {Component} from 'react'
import { ScrollView, StyleSheet, View, Text } from 'react-native'
import PropTypes from 'prop-types'
import {List, ListItem, Icon} from 'react-native-elements'
import * as Animatable from 'react-native-animatable'
import I18n from '../../I18n/I18n'

import FullScreenView from '../../Components/FullScreenView'
import SelectableFoodList from './SelectableFoodList'
import {FoodList} from './Food'
import {FoodCategories} from './FoodMetrics'
import {Colors, Fonts} from '../../Themes/'

class Categories extends Component {
  static propTypes = {
    onSelectFood: PropTypes.func,
    onBack: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      currentCategory: null
    }
  }

  render () {
    if (this.state.currentCategory) {
      return (
        <FullScreenView title={this.state.currentCategory} onBack={() => this.setState({currentCategory: null})}>
          <CategoryView
            category={this.state.currentCategory}
            onSelectFood={this.props.onSelectFood}
          />
        </FullScreenView>
      )
    } else {
      return (
        <FullScreenView title={I18n.t('FoodDiary.categories')} onBack={this.props.onBack}>
          <ScrollView>
            <CategoryList
              categories={FoodCategories}
              onPress={(category) => this.setState({currentCategory: category.categoryName})}
            />
          </ScrollView>
        </FullScreenView>
      )
    }
  }
}

export default Categories

class CategoryList extends Component {
  static propTypes = {
    onPress: PropTypes.func
  }
  render () {
    return (
      <List containerStyle={styles.listContainer}>
        {FoodCategories.map((category, index) => (
          <CategoryListItem key={index} category={category} onPress={this.props.onPress} />
        ))}
      </List>
    )
  }
}

class CategoryListItem extends Component {
  state = {
    infoCollapsed: true
  }
  toggleVisibility () {
    if (this.state.infoCollapsed) {
      this.toggleInfoCollapsed()
      this.refs.view.slideInRight(280)
    } else this.refs.view.flipOutX(280).then(() => this.toggleInfoCollapsed())
  }

  toggleInfoCollapsed () {
    this.setState({
      infoCollapsed: !this.state.infoCollapsed
    })
  }
  render () {
    const {category} = this.props
    return (
      <ListItem
        onPress={() => this.props.onPress(category)}
        title={
          <View style={styles.titleView}>
            <Text numberOfLines={1} style={styles.title}>{I18n.t('FoodCategories.' + category.id)}</Text>
          </View>
        }
        containerStyle={{paddingTop: 20, paddingBottom: 20, justifyContent: 'center'}}
        badge={category.info ? { element: <Icon onPress={() => this.toggleVisibility()} name='info-with-circle' type='entypo' color={Colors.main.grey2} containerStyle={{position: 'absolute', top: -1, right: 30}} /> } : null}
        subtitle={this.renderInfo(category)}
        rightIcon={<Icon name='ios-arrow-forward' type='ionicon' color={Colors.main.grey2} containerStyle={{position: 'absolute', top: 0, right: 10}} />}
      />
    )
  }
  renderInfo (category) {
    const {info} = category
    if (info) {
      return (
        <Animatable.View
          ref='view'
          style={[{overflow: 'hidden'}, this.state.infoCollapsed ? {height: 0} : null]}
        >
          <View style={styles.infoWrapper}>
            <View style={[styles.triangleCorner, this.state.infoCollapsed ? {borderBottomColor: 'transparent'} : null]} />
            <View style={[styles.infoContainer, this.state.infoCollapsed ? {backgroundColor: 'transparent', borderColor: 'transparent'} : null]}>
              <Text style={styles.info}>{I18n.t('FoodCategories.' + category.id + 'info')}</Text>
            </View>
          </View>
        </Animatable.View>
      )
    } else return null
  }
}

class CategoryView extends Component {
  static propTypes = {
    onSelectFood: PropTypes.func,
    category: PropTypes.string
  }
  render () {
    let foodList = this.getCategoryFood(this.props.category)
    return (
      <SelectableFoodList onSelectFood={this.props.onSelectFood} foodList={foodList} emptyNotice='' />
    )
  }

  getCategoryFood (categoryName) {
    let categoryFood = []
    for (let i = 0; i < FoodList.length; i++) {
      if (FoodList[i].category && FoodList[i].category.includes(categoryName)) {
        // Special case for salad-categories (don't include "heavy salads" in salad category)
        if (!(FoodList[i].category === 'Salate, angemacht' && categoryName === 'Salate')) categoryFood.push(FoodList[i])
      }
    }
    return categoryFood.sort((a, b) => this.sortFoodList(a, b))
  }

  sortFoodList (a, b) {
    let textA = I18n.t('FoodCategories.' + a.id).toUpperCase().replace('Ä', 'AE').replace('Ü', 'UE').replace('Ö', 'OE')
    let textB = I18n.t('FoodCategories.' + b.id).toUpperCase().replace('Ä', 'AE').replace('Ü', 'UE').replace('Ö', 'OE')
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  }
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0
  },
  emptyNotice: {
    fontSize: 18,
    padding: 20,
    color: Colors.main.grey2
  },
  list: {
    flex: 1,
    marginTop: 0,
    backgroundColor: Colors.main.appBackground
  },
  infoWrapper: {
    paddingTop: 20
  },
  infoContainer: {
    flex: 1,
    backgroundColor: Colors.main.grey3,
    padding: 13,
    borderColor: Colors.main.grey3,
    borderRadius: 8
  },
  titleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 35
  },
  title: {
    fontSize: Fonts.size.regular,
    color: Colors.main.grey1
  },
  info: {
    color: Colors.main.grey1,
    textAlign: 'right'
  },
  triangleCorner: {
    position: 'absolute',
    top: 5,
    right: 43,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 17,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderBottomColor: Colors.main.grey3
  }
})
