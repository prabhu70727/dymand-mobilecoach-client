
// TODO for improvement check: https://github.com/idibidiart/react-native-responsive-grid/blob/master/UniversalTiles.md

import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import {Metrics, Colors} from '../../Themes/'
import CardView from 'react-native-cardview'
import * as Animatable from 'react-native-animatable'
import PMNavigationBar from '../../Components/Navbar'
import I18n from '../../I18n/I18n'
import FileViewer from 'react-native-file-viewer'
import RNFetchBlob from 'react-native-fetch-blob'
import RNFS from 'react-native-fs'

import RecipePaths from './RecipePaths'
import InfoButton from '../../Components/InfoButton'

import Log from '../../Utils/Log'
const log = new Log('Containers/Recipes/Recipes')

const CARD_WIDTH = Metrics.screenWidth / 2 * 0.9
const CARD_HEIGHT = CARD_WIDTH
const INITIAL_DELAY = 0 // 1000
const DELAY = 0 // 300

class Item extends Component {
  render () {
    // this.props.onPress()
    return (
      <TouchableWithoutFeedback onPress={() => this.refs.view.pulse(250).then(() => this.props.onPress())}>
        <Animatable.View useNativeDriver ref='view' delay={this.props.delay} animation='fadeIn' style={{backgroundColor: 'transparent', height: CARD_HEIGHT}}>
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
              {this.props.subtitle ? <Text style={styles.subtitle}>{this.props.subtitle}</Text> : null}
            </View>
          </CardView>
        </Animatable.View>
      </TouchableWithoutFeedback>
    )
  }
}

class Recipes extends Component {
  constructor (props) {
    super(props)
    this.baseUrl = null
  }

  componentWillMount () {
    if (Platform.OS === 'ios') {
      this.baseDir = RNFetchBlob.fs.dirs.MainBundleDir + '/Web/assets/pdf/recipes/'
    } else if (Platform.OS === 'android') {
      this.baseDir = 'web/assets/pdf/recipes/'
    }
  }

  renderNavigationbar (props) {
    let title = I18n.t('Recipes.header')
    return (
      <PMNavigationBar title={title} props={props}
        rightButton={<InfoButton onPress={() => { this.openPDF(RecipePaths['info_' + this.props.language].path) }} />}
      />
    )
  }

  render () {
    return (
      <View style={styles.container}>
        {this.renderNavigationbar(this.props)}
        <View style={styles.content}>
          <Image source={require('../../Images/Recipes/recipes.jpg')} style={styles.backgroundImage} />
          <ScrollView style={styles.grid} indicatorStyle='white'>
            {this.renderGrid()}
          </ScrollView>
        </View>
      </View>
    )
  }

  openPDF (filename) {
    const path = this.baseDir + filename
    if (Platform.OS === 'ios') {
      FileViewer.open(path).then(() => {
        log.info('Opened Recipe-PDF successfully')
      }).catch((error) => {
        log.warn('Could not open Recipe PDF on ios', error)
      })
    // On android, we need to decompress assets first, and then we can show them
    } else {
      // destination path for copied PDF
      const dest = `${RNFS.DocumentDirectoryPath}/recipe.pdf`
      // decompress and copy to destination...
      RNFS.copyFileAssets(path, dest)
        .then(() => {
          // then open the PDF
          FileViewer.open(dest)
          .then(() => {
            log.info('Opened Recipe-PDF successfully')
          })
          .catch((error) => {
            log.warn('Could not find a suitable application to open PDF.', error)
          })
        })
        .catch((error) => {
          log.warn('Could not open PDF from android assets.', error)
        })
    }
  }

  sortRecipes (a, b) {
    let recipeA = a.recipeName.toUpperCase().replace('Ä', 'AE').replace('Ü', 'UE').replace('Ö', 'OE')
    let recipeB = b.recipeName.toUpperCase().replace('Ä', 'AE').replace('Ü', 'UE').replace('Ö', 'OE')
    return (recipeA < recipeB) ? -1 : (recipeA > recipeB) ? 1 : 0
  }

  renderGrid () {
    const recipes = RecipePaths[this.props.language].sort((a, b) => this.sortRecipes(a, b))
    return (
      <View style={{marginBottom: 20}}>
        {recipes.map((recipe, index, array) => {
          if (index % 2 === 0) {
            return (
              <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: 20
              }}>
                <Item key={index} delay={INITIAL_DELAY + index * DELAY} title={recipe.recipeName} subtitle={recipe.vegetarian ? I18n.t('Recipes.vegetarian') : null} onPress={() => this.openPDF(recipe.path)} />
                {array[index + 1] !== undefined ? <Item key={index + 1} delay={INITIAL_DELAY + (index + 0.5) * DELAY} title={array[index + 1].recipeName} subtitle={array[index + 1].vegetarian ? I18n.t('Recipes.vegetarian') : null} onPress={() => this.openPDF(array[index + 1].path)} /> : null}
              </View>
            )
          }
        })}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.settings.language,
    backpackInformation: state.storyProgress.backpackInfo
  }
}

export default connect(mapStateToProps)(Recipes)

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
