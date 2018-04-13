import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import PropTypes from 'prop-types'
import { Colors } from '../../Themes'
import { MessageStates } from '../../Redux/MessageRedux'

  // PREPARED_FOR_SENDING: 'PREPARED_FOR_SENDING',
  // SENT: 'SENT',
  // PROCESSED_BY_SERVER: 'PROCESSED_BY_SERVER',
  // RECEIVED: 'RECEIVED',
  // OPEN_QUESTION: 'OPEN_QUESTION',
  // ANSWERED: 'ANSWERED',
  // NOT_ANSWERED: 'NOT_ANSWERED' }
export default class Ticks extends Component {
  static propTypes = {
    currentMessage: PropTypes.object
  }

  render () {
    // {currentMessage.sent && <Text style={[TextBubbleStyle.ticks.tick, this.props.tickStyle]}>✓</Text>}
    const { currentMessage } = this.props
    // Don't display the ticks on server-messages
    if (currentMessage.user._id === 1) {
      return (
        <View style={styles.tickView}>
          {this.renderTicks()}
        </View>
      )
    } else return null
  }

  renderTicks () {
    const { currentMessage } = this.props
    switch (currentMessage.custom.clientStatus) {
      case MessageStates.PREPARED_FOR_SENDING:
        return <Icon name='clock' type='material-community' color={Colors.messageBubbles.ticks.unread} size={12} />
      case MessageStates.SENT:
        return <Icon name='check' type='material-community' color={Colors.messageBubbles.ticks.unread} size={12} />
      case MessageStates.PROCESSED_BY_SERVER:
        return <Icon name='check-all' type='material-community' color={Colors.messageBubbles.ticks.read} size={12} />
      default:
        return null
    }
  }
}

const styles = StyleSheet.create({
  tickView: {
    flexDirection: 'row',
    marginRight: 5,
    marginBottom: 5
  }
})
