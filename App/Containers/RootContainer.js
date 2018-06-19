import React, { Component } from 'react'
import { View, StatusBar } from 'react-native'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import { connect } from 'react-redux'
import StartupActions from '../Redux/StartupRedux'
import ServerSyncActions from '../Redux/ServerSyncRedux'
import PropTypes from 'prop-types'

class RootContainer extends Component {
  render () {
    return (
      <View style={{flex: 1}}>
        <StatusBar barStyle='light-content' />
        <ReduxNavigation />
      </View>
    )
  }
}

// wraps dispatch to create nicer functions to call within our component
const mapDispatchToProps = (dispatch) => ({
  startup: () => dispatch(StartupActions.startup()),
  serverSyncInitialize: () => dispatch(ServerSyncActions.initialize())
})

export default connect(null, mapDispatchToProps)(RootContainer)

RootContainer.propTypes = {
  startup: PropTypes.func.isRequired
}
