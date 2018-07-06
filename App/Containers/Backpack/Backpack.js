
// TODO for improvement check: https://github.com/idibidiart/react-native-responsive-grid/blob/master/UniversalTiles.md

import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableWithoutFeedback
} from 'react-native'

import { connect } from 'react-redux'
import {Metrics, Colors} from '../../Themes/'
import CardView from 'react-native-cardview'
import * as Animatable from 'react-native-animatable'
import PMNavigationBar from '../../Components/Navbar'
import I18n from '../../I18n/I18n'

const CARD_WIDTH = Metrics.screenWidth / 2 * 0.9
const CARD_HEIGHT = CARD_WIDTH
const INITIAL_DELAY = 1000
const DELAY = 300

class Item extends Component {
  render () {
    return (
      <TouchableWithoutFeedback onPress={() => this.refs.view.pulse(250).then(() => this.props.onPress())}>
        <Animatable.View useNativeDriver ref='view' delay={this.props.delay} animation='flipInX' style={{backgroundColor: 'transparent', height: CARD_HEIGHT}}>
          <CardView
            cardElevation={2}
            cardMaxElevation={2}
            cornerRadius={5}
            style={{backgroundColor: Colors.buttons.common.background}}
            >
            <View style={{
              height: CARD_HEIGHT,
              width: CARD_WIDTH,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10
            }}>
              <Text style={styles.title}>{this.props.title}</Text>
              <Text style={styles.subtitle}>{this.props.subtitle}</Text>
            </View>
          </CardView>
        </Animatable.View>
      </TouchableWithoutFeedback>
    )
  }
}

class Backpack extends Component {
  renderNavigationbar (props) {
    let title = I18n.t('Backpack.header')
    return (
      <PMNavigationBar title={title} props={props} rightButton={<View />} />
    )
  }

  render () {
    return (
      <View style={styles.container}>
        {this.renderNavigationbar(this.props)}
        <View style={styles.content}>
          <Image source={require('../../Images/Backpack/backpack.jpg')} style={styles.backgroundImage} />
          <ScrollView style={styles.grid} indicatorStyle='white'>
            {this.renderGrid()}
          </ScrollView>
        </View>
      </View>
    )
  }

  renderGrid () {
    const {backpackInformation} = this.props
    const { showModal } = this.props.screenProps
    let infoArray = []
    Object.keys(backpackInformation).map((key, index) => {
      const info = backpackInformation[key]
      infoArray.push(info)
    })
    // Sort Array from timestamp
    infoArray.sort((a, b) => {
      if (a.time > b.time) {
        return 1
      }
      if (a.time < b.time) {
        return -1
      }
      return 0
    })
    return (
      infoArray.map((info, index, array) => {
        if (index % 2 === 0) {
          return (
            <View key={index} style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 30,
              marginBottom: 30
            }}>
              <Item key={index} delay={INITIAL_DELAY + index * DELAY} title={info.title} subtitle={info.subtitle} onPress={() => showModal('rich-text', {htmlMarkup: info.content})} />
              {array[index + 1] !== undefined ? <Item key={index + 1} delay={INITIAL_DELAY + (index + 0.5) * DELAY} title={array[index + 1].title} subtitle={array[index + 1].subtitle} onPress={() => showModal('rich-text', {htmlMarkup: array[index + 1].content})} /> : null}
            </View>
          )
        }
      })
    )
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.settings.language,
    backpackInformation: state.storyProgress.backpackInfo
  }
}

export default connect(mapStateToProps)(Backpack)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.main.appBackground
  },
  content: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover'
  },
  grid: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  title: {textAlign: 'center', fontSize: 18, color: Colors.buttons.common.text},
  subtitle: {marginTop: 10, textAlign: 'center', fontSize: 14, color: Colors.buttons.common.text}
})
