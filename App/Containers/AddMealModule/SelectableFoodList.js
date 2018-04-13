import React, {Component} from 'react'
import {View, Text, StyleSheet, FlatList} from 'react-native'
import {List, ListItem, Icon} from 'react-native-elements'
import PropTypes from 'prop-types'
import Button from 'react-native-button'
import * as Animatable from 'react-native-animatable'
import I18n from '../../I18n/I18n'

import {Colors, Fonts} from '../../Themes'

// import Log from '../../Utils/Log'
// const log = new Log('AddMealModule/SelectableFoodList')

class FoodListItem extends Component {
  static propTypes = {
    food: PropTypes.object.isRequired,
    onSelectFood: PropTypes.func.isRequired
  }

  state = {
    brandsCollapsed: true
  }

  renderBrands () {
    const {brands} = this.props.food
    if (brands.length > 0) {
      return (
        <Animatable.View
          ref='view'
          style={[{overflow: 'hidden'}, this.state.brandsCollapsed ? {height: 0} : null]}
        >
          <View style={styles.brandsWrapper}>
            <View style={[styles.triangleCorner, this.state.brandsCollapsed ? {borderBottomColor: 'transparent'} : null]} />
            <View style={[styles.brandsContainer, this.state.brandsCollapsed ? {backgroundColor: 'transparent', borderColor: 'transparent'} : null]}>
              <Text style={[styles.brands, {color: Colors.main.grey1}]}>{I18n.t('FoodDiary.brandsTitle')}</Text>
              <Text style={styles.brands}>{brands.join(', ')}</Text>
            </View>
          </View>
        </Animatable.View>
      )
    } else return null
  }

  toggleVisibility () {
    if (this.state.brandsCollapsed) {
      this.toggleBrandsCollapsed()
      this.refs.view.slideInRight(280)
    } else this.refs.view.flipOutX(280).then(() => this.toggleBrandsCollapsed())
  }

  toggleBrandsCollapsed () {
    this.setState({
      brandsCollapsed: !this.state.brandsCollapsed
    })
  }

  renderBrandsIcon () {
    return (
      <Button
        activeOpacity={0.5}
        containerStyle={{padding: 10, position: 'absolute', right: 0, top: 5}}
        onPress={() => this.toggleVisibility()}>
        <Icon name='info-with-circle' type='entypo' color={Colors.main.grey2} />
      </Button>
    )
  }

  render () {
    const {food} = this.props
    let selectable = true
    return (
      <ListItem
        onPress={() => {
          if (selectable) this.props.onSelectFood(food)
        }}
        id={food.id}
        containerStyle={[selectable ? null : styles.disabled, {zIndex: 0}]}
        title={
          <View style={styles.titleView}>
            <Text numberOfLines={1} style={[styles.title, food.brands.length > 0 ? {marginRight: 50} : null]}>{food.foodnameDE}</Text>
          </View>
        }
        subtitle={
          <View style={styles.subtitleView}>
            <Text numberOfLines={1} style={[styles.subTitle, food.brands.length > 0 ? {marginRight: 50} : null]}>{food.shadowDE ? food.shadowDE : food.foodGroup}</Text>
            {this.renderBrands()}
          </View>
        }
        badge={food.brands.length > 0 ? { element: this.renderBrandsIcon() } : null}
        hideChevron
      />
    )
  }
}

export default class SelectableFoodList extends Component {
  static propTypes = {
    foodList: PropTypes.array,
    onSelectFood: PropTypes.func,
    emptyNotice: PropTypes.string
  }

  render () {
    if (this.props.foodList.length === 0) {
      return (
        <Text style={styles.emptyNotice}>
          {this.props.emptyNotice}
        </Text>
      )
    } else {
      return (
        <List containerStyle={styles.list}>
          <FlatList
            data={this.props.foodList}
            renderItem={({item}) => <FoodListItem food={item} onSelectFood={(food) => this.props.onSelectFood(food)} />}
            keyExtractor={(item, index) => index}
            keyboardShouldPersistTaps='always'
          />
        </List>
      )
    }
  }
}

const styles = StyleSheet.create({
  emptyNotice: {
    fontSize: 18,
    padding: 20,
    color: Colors.main.grey2
  },
  list: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#fff'
  },
  brandsWrapper: {
    paddingTop: 15
  },
  brandsContainer: {
    flex: 1,
    backgroundColor: Colors.main.grey3,
    padding: 13,
    borderColor: Colors.main.grey3,
    borderRadius: 8
  },
  titleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5
  },
  disabled: {
    backgroundColor: Colors.buttons.common.disabled
  },
  subtitleView: {
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5
  },
  title: {
    fontSize: Fonts.size.regular,
    color: Colors.main.grey1
  },
  subTitle: {
    color: Colors.main.grey2
  },
  brands: {
    color: Colors.main.grey2,
    textAlign: 'right'
  },
  triangleCorner: {
    position: 'absolute',
    top: 0,
    right: 23,
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
