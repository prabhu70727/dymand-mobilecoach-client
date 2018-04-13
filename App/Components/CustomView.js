import React, { Component } from 'react'
import {View, ScrollView, StyleSheet} from 'react-native'

import HeaderBar from './HeaderBar'

export default class CustomView extends Component {
  render () {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column'
      }}>
        <HeaderBar title='Information' onClose={this.props.onClose} />
        <ScrollView style={styles.container}>
          {this.props.children}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    flexDirection: 'column',
    paddingLeft: 20,
    paddingRight: 20
  }
})
