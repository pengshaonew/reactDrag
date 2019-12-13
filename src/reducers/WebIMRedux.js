import WebIM from '../config/WebIM'

import { message, Modal } from 'antd'

const logger = WebIM.loglevel.getLogger('WebIMRedux');

WebIM.conn.listen({
    // success connect to xmpp
    onOpened: msg => {

    },
    onPresence: msg => {

    },
    // handle all exception
    onError: error => {

    },
    onClosed: msg => {

    },
    onBlacklistUpdate: list => {

    },
    onReadMessage: message => {

    },
    onDeliveredMessage: message => {

    },
    onReceivedMessage: message => {

    },
    onRecallMessage: message => {

    },
    onLocationMessage: message =>{ //位置消息

    },
    onTextMessage: message => {
        //console.log("onTextMessage", message)

    },
    onPictureMessage: message => {

    },
    onFileMessage: message => {

    },
    onAudioMessage: message => {

    },
    onVideoMessage: message => {

    },
    onInviteMessage: msg => {

    },
    onMutedMessage: msg => {

    }
})


/* ------------- Selectors ------------- */

/** Constants: Connection Status Constants
 *  Connection status constants for use by the connection handler
 *  callback.
 *
 *  Status.ERROR - An error has occurred
 *  Status.CONNECTING - The connection is currently being made
 *  Status.CONNFAIL - The connection attempt failed
 *  Status.AUTHENTICATING - The connection is authenticating
 *  Status.AUTHFAIL - The authentication attempt failed
 *  Status.CONNECTED - The connection has succeeded
 *  Status.DISCONNECTED - The connection has been terminated
 *  Status.DISCONNECTING - The connection is currently being terminated
 *  Status.ATTACHED - The connection has been attached
 *  Status.CONNTIMEOUT - The connection has timed out
 */
