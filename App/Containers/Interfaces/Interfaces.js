import React, {Component} from 'react'
import ForegroundServiceModule from './ForegroundServiceModule'
import DymandFGServiceModule from './DymandFGServiceModule'
import {DeviceEventEmitter, Vibration} from 'react-native'
import MessageActions from '../../Redux/MessageRedux'
import { connect } from 'react-redux'

import Log from '../../Utils/Log'
const log = new Log('Interfaces')

class Interfaces extends Component {
    componentDidMount = () => {
        log.debug("componentDidMount called")
        DymandFGServiceModule.startService(
            (msg) => {
                log.error("Error while starting the service: " + msg)
        }, 
            () => {
                log.debug("Adding listeners")
                //It is important that there is EXACTLY only one "DymandFGService" service created and 
                // it needs to stay on because the listeners depend on them. The listeners had to be added 
                // only once when starting the service. 
                DeviceEventEmitter.addListener('USER_INTENT_RECORDING_DONE_LISTENER_TAG', 
                    this.sendIntentToServerRecordingDone)
                DeviceEventEmitter.addListener('USER_INTENT_CONFIG_SENT_LISTENER_TAG', 
                    this.sendIntentToServerConfigSent)
                DeviceEventEmitter.addListener('USER_INTENT_SELF_REPORT_DONE_ACK_LISTENER_TAG', 
                    this.sendIntentToServerSelfReportDoneACK)
        }) 
    }

    componentWillUnmount () {
        log.debug("Component will un-Mount from Interfaces called")
    }

    sendIntentToServerRecordingDone = () => {
        const {sendRecordingDoneIntention} = this.props
        sendRecordingDoneIntention()
        Vibration.vibrate(500)
        // After 2 min, vibrate again with a notification
        DymandFGServiceModule.timedWakeLockAndRemindUserSelfReportNotification("2")
        console.log('Sending recording done User-Intent to Server')
    };

    sendIntentToServerRemindUserSelfReport = () => {
        const {sendRemindUserSelfReportIntention} = this.props
        sendRemindUserSelfReportIntention()
        console.log('Sending reminder self report User-Intent to Server')
    };

    sendIntentToServerConfigSent = () => {
        const {sendConfigSentIntention} = this.props
        sendConfigSentIntention()
        console.log('Sending config sent User-Intent to Server')
    };

    sendIntentToServerSelfReportDoneACK = () => {
        const {sendSelfReportDoneACKIntention} = this.props
        sendSelfReportDoneACKIntention()
        console.log('Sending self report done (ack) User-Intent to Server')
    };

    render () {
        log.debug("Render called")
        return null;
    }
}

const mapStateToDispatch = dispatch => ({
    sendRecordingDoneIntention: () => dispatch(MessageActions.sendIntention(null, 'RecordingDone', null)),
    sendRemindUserSelfReportIntention: () => dispatch(MessageActions.sendIntention(null, 'RemindUserSelfReport', null)),
    sendConfigSentIntention: () => dispatch(MessageActions.sendIntention(null, 'ConfigSent', null)),
    sendSelfReportDoneACKIntention: () => dispatch(MessageActions.sendIntention(null, 'SelfReportDoneACK', null)),
})

export default connect(null, mapStateToDispatch)(Interfaces)