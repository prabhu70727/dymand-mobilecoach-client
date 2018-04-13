import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../Themes/'
import I18n from '../../I18n/I18n'
import * as Animatable from 'react-native-animatable'

export default class OfflineStatusIndicator extends Component {
  render () {
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <Animatable.View useNativeDriver style={[styles.wrapper, this.props.wrapperStyle]} delay={5000} duration={350} animation='flipInX'>
          <Text style={[styles.text, this.props.textStyle]}>
            {I18n.t('ConnectionStates.offlineNotice')}
          </Text>
        </Animatable.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 5,
    marginBottom: 10
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.connectionIndicator.intermediateState,
    borderRadius: 15,
    height: 30,
    paddingLeft: 10,
    paddingRight: 10
  },
  text: {
    backgroundColor: 'transparent',
    color: Colors.messageBubbles.system.text,
    fontSize: 12,
    fontWeight: '300'
  }
})
