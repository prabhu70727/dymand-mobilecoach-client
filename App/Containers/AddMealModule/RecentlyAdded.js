import React, {Component} from 'react'
import { ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import SelectableFoodList from './SelectableFoodList'
import I18n from '../../I18n/I18n'

import FullScreenView from '../../Components/FullScreenView'

class RecentlyAdded extends Component {
  static propTypes = {
    onSelectFood: PropTypes.func,
    onBack: PropTypes.func
  }

  render () {
    return (
      <FullScreenView title={I18n.t('FoodDiary.recentlyAdded')} onBack={this.props.onBack}>
        <ScrollView>
          <SelectableFoodList onSelectFood={this.props.onSelectFood} foodList={this.props.foodList} emptyNotice={I18n.t('FoodDiary.emptyNotice')} />
        </ScrollView>
      </FullScreenView>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    foodList: state.fooddiary.recentlyAddedFood
  }
}

export default connect(mapStateToProps)(RecentlyAdded)
