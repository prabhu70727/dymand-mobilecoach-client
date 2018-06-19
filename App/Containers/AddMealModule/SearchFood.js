import React, {Component} from 'react'
import {ListView, View, StyleSheet, Platform} from 'react-native'
import {Icon} from 'react-native-elements'
import SearchBar from 'react-native-searchbar'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import {ifIphoneX} from 'react-native-iphone-x-helper'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import I18n from '../../I18n/I18n'

import SelectableFoodList from './SelectableFoodList'
import {Colors} from '../../Themes'
import {FoodList} from './Food'

export default class SearchFood extends Component {
  static propTypes = {
    onSelectFood: PropTypes.func,
    onBack: PropTypes.func
  }
  constructor () {
    super()

    const searchOptions = {
      shouldSort: false,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      includeScore: true,
      minMatchCharLength: 3,
      keys: [
        'foodnameDE',
        'brands',
        'shadowDE'
      ]
    }
    this.fuse = new Fuse(FoodList, searchOptions)

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

    this.state = {
      currentInput: '',
      searchResults: []
    }
  }

  handleSearch = input => {
    let results = []

    results = this.fuse.search(input)
    // Custom refinements for optimized search results
    results = this.refineSearch(results, input)
    results.sort((a, b) => { return (a.score - b.score) })

    let resultItems = []
    for (let i = 0; i < results.length; i++) {
      resultItems.push(results[i].item)
    }

    this.setState({
      searchResults: resultItems
    })
  }

  refineSearch (results, input) {
    for (let i = 0; i < results.length; i++) {
      let result = results[i]
      let foodNames = ['foodnameDE', 'foodnameFR', 'foodnameIT']
      let shadowNames = ['shadowDE', 'shadowFR', 'shadowIT']
      const {brands} = results[i]
      foodNames.forEach((foodName) => {
        if (result.item[foodName] !== null && typeof result.item[foodName] !== 'undefined') {
          // Check if user input matches Foodname completely (if true, add 0.5 to score)
          if (result.item[foodName].toUpperCase() === input.toUpperCase()) result.score = 0
          else {
            // Check if the full seachTerm is partially included, but as a Full Term (e.g. search Term: 'Reiss', result: 'Reiss (weiss)' )
            if (result.item[foodName].includes(input + ' ')) result.score = result.score * 0.01
          }
        }
      })
      for (let h = 0; h < shadowNames.length; h++) {
        let shadowName = shadowNames[h]
        if (result.item[shadowName] !== null && typeof result.item[shadowName] !== 'undefined') {
          // Check if user input matches Foodname completely (if true, add 0.5 to score)
          if (result.item[shadowName] === input || result.item[shadowName].includes(input + ' ') || result.item[shadowName].includes(' ' + input)) {
            result.score = result.score * 0.02
            break
          }
        }
      }
      if (brands !== null && typeof brands !== 'undefined') {
        for (let j = 0; j < brands.length; j++) {
          let brand = brands[j]
          if (brand.toUpperCase() === input.toUpperCase()) {
            result.score = result.score * 0.01
            break
          }
        }
      }
    }
    return results
  }

  getEmptyNotice () {
    if (this.refs.searchbar && this.refs.searchbar.getValue() !== '') return I18n.t('FoodDiary.noSearchResults')
    else return I18n.t('FoodDiary.emptySearch')
  }

  render () {
    return (
      <View style={styles.container}>
        <SearchBar
          ref='searchbar'
          handleSearch={this.handleSearch}
          placeholder={I18n.t('FoodDiary.searchFood')}
          showOnLoad
          autoCorrect={false}
          backButton={
            <Icon name='ios-arrow-back' type='ionicon' iconStyle={styles.backIcon} />
          }
          onBack={this.props.onBack}
          allDataOnEmptySearch={false}
          autoCapitalize='words'
          heightAdjust={0}
        />
        <View style={styles.listContainer}>
          <SelectableFoodList
            onSelectFood={this.props.onSelectFood}
            foodList={this.state.searchResults}
            emptyNotice={this.getEmptyNotice()}
          />
        </View>
        {Platform.OS === 'ios' ? <KeyboardSpacer /> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  // TODO: This might be adjusted for android
  listContainer: {
    flex: 1,
    ...Platform.select({
      ios: {
        marginTop: 72
      },
      android: {
        marginTop: 62
      }
    })
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    ...ifIphoneX({
      marginTop: 40
    })
  },
  backIcon: {
    fontSize: 30,
    color: Colors.main.grey2
  }
})
