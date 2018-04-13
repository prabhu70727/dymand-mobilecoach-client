import React, {Component} from 'react'
import {View, StyleSheet, Dimensions} from 'react-native'
import I18n from '../../I18n/I18n'
import {connect} from 'react-redux'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'

import AddMealActionButton from '../AddMealModule/AddMealActionButton'
import {Colors} from '../../Themes/'
import DiaryView from './DiaryView'
import PyramidView from './PyramidView'
import PMNavigationBar from '../../Components/Navbar'
import StoryProgressActions from '../../Redux/StoryProgressRedux'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

class FoodDiary extends Component {
  constructor (props) {
    super(props)
    let initialTab = 0
    // If initial tab was passed as argument, use it
    if (props.navigation.state.params && props.navigation.state.params.initialTab) initialTab = props.navigation.state.params.initialTab
    this.state = {
      index: initialTab,
      routes: [
        { key: 'diary', title: I18n.t('FoodDiary.diary') },
        { key: 'pyramid', title: I18n.t('FoodDiary.pyramid') }
      ]
    }
  }

  _renderActionButton () {
    const { showModal } = this.props.screenProps
    if (this.props.storyProgress.actionButtonActive) {
      return (
        <AddMealActionButton
          showModal={showModal}
          />
      )
    } else {
      return null
    }
  }

  _handleIndexChange = (index) => {
    if (index === 1) this.props.visitScreen('Pyramid')
    this.setState({ index })
  }

  _renderHeader = props => <TabBar {...props} style={styles.tabStyle} labelStyle={styles.tabLabel} pressColor={'#000'} indicatorStyle={styles.indicator} />

  _renderScene = SceneMap({
    diary: DiaryView,
    // Note that props passed this way won't update on changes (see: https://github.com/react-native-community/react-native-tab-view/issues/241)
    // in this case this is not relevant though
    pyramid: () => <PyramidView showModal={this.props.screenProps.showModal} infoText={this.props.cachedText['backpack-info-90']} />
  })

  renderMainContent () {
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        onIndexChange={this._handleIndexChange}
        initialLayout={initialLayout}
      />
    )
  }

  renderNavigationbar (props) {
    let title = I18n.t('FoodDiary.yourDiary')

    return (
      <PMNavigationBar title={title} props={props} />
    )
  }

  render () {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        {this.renderNavigationbar(this.props)}
        <View style={styles.container}>
          {this.renderMainContent()}
        </View>
        {this._renderActionButton()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    fooddiary: state.fooddiary,
    storyProgress: state.storyProgress,
    cachedText: state.cachedText
  }
}

const mapStateToDispatch = dispatch => ({
  visitScreen: (visitedScreen) => dispatch(StoryProgressActions.visitScreen(visitedScreen))
})

export default connect(mapStateToProps, mapStateToDispatch)(FoodDiary)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: Colors.main.grey3,
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  tabStyle: {
    backgroundColor: Colors.modules.foodDiary.tabs.background
  },
  indicator: {
    backgroundColor: Colors.modules.foodDiary.tabs.indicator
  },
  tabLabel: {
    color: Colors.modules.foodDiary.tabs.text
  }
})
