import WebIM from '@/config/WebIM';
import _ from 'lodash'
import store from 'redux'


/* ------------- Types and Action Creators ------------- */

const msgTpl = {
    base: {
        error: false,
        errorCode: '',
        errorText: '',
        // if status is blank, it's treated as "sent" from server side
        status: 'sending', // [sending, sent ,fail, read]
        id: '',
        // from - room id need it,should not be deleted
        from: '',
        to: '',
        toJid: '',
        time: '',
        type: '', // chat / groupchat
        body: {},
        ext: {},
        bySelf: false
    },
    txt: {
        type: 'txt',
        msg: ''
    },
    img: {
        type: 'img',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
    },
    file: {
        type: 'file',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
    },
    video: {
        type: 'video',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
    },
    audio: {
        type: 'audio',
        file_length: 0,
        filename: '',
        filetype: '',
        length: 0,
        secret: '',
        width: 0,
        height: 0,
        url: '',
        thumb: '',
        thumb_secret: ''
    }
}

// unify message format: local side
function parseFromLocal(type, to, message = {}, bodyType) {
    let ext = message.ext || {};
    let obj = copy(message, msgTpl.base);
    let body = copy(message, msgTpl[bodyType]);
    return {
        ...obj,
        type,
        to,
        id: WebIM.conn.getUniqueId(),
        body: {
            ...body,
            ...ext,
            type: bodyType
        }
    }
}

// unify message format: server side
export const parseFromServer = (message = {}, bodyType) => {
    let ext = message.ext || {};
    let obj = copy(message, msgTpl.base);
    let body = copy(message, msgTpl[bodyType]);
    switch (bodyType) {
        case 'txt':
            return {
                ...obj,
                status: 'sent',
                body: {
                    ...body,
                    ...ext,
                    msg: message.data,
                    type: 'txt'
                }
            }
            break
        case 'img':
            return {
                ...obj,
                status: 'sent',
                body: {
                    ...body,
                    ...ext,
                    type: 'img'
                }
            }
            break
        case 'file':
            return {
                ...obj,
                status: 'sent',
                body: {
                    ...body,
                    ...ext,
                    type: 'file'
                }
            }
            break
        case 'audio':
            return {
                ...obj,
                status: 'sent',
                body: {
                    ...body,
                    ...ext,
                    type: 'audio'
                }
            }
            break
        case 'video':
            return {
                ...obj,
                status: 'sent',
                body: {
                    ...body,
                    ...ext,
                    type: 'video'
                }
            }
            break
    }
}

function copy(message, tpl) {
    let obj = {}
    Object.keys(tpl).forEach(v => {
        obj[v] = message[v] || tpl[v]
    })
    return obj
}


/* ------------- Reducers ------------- */
/**
 * add message to store
 * @param state
 * @param message object `{data,error,errorCode,errorText,ext:{weichat:{originType:webim}},from,id,to,type}`
 * @param bodyType enum [txt]
 * @returns {*}
 */
export const addMessage = (state, {message, bodyType = 'txt'}) => {
    !message.status && (message = parseFromServer(message, bodyType));
    const rootState = store.getState();
    const username = _.get(rootState, 'login.username', '');
    const {id, to, status} = message;
    let {type} = message;
    const from = message.from || username;
    const bySelf = from == username;
    let chatId = bySelf || type !== 'chat' ? to : from;
    if (type === 'stranger') {
        chatId = from
    }

    const chatData = state.getIn([type, chatId], Immutable([])).asMutable()
    const _message = {
        ...message,
        bySelf,
        time: +new Date(),
        status: status
    }

    // the pushed message maybe have exsited in state, ignore
    if (_message.type === 'chatroom' && bySelf) {
        const oid = state.getIn(['byMid', _message.id, 'id'])
        if (oid) {
            _message.id = oid
        }
    }

    let isPushed = false
    chatData.forEach(m => {
        if (m.id === _message.id) {
            isPushed = true
        }
    })

    !isPushed && chatData.push(_message)

    // add a message to db, if by myselt, isUnread equals 0
    !isPushed && AppDB.addMessage(_message, !bySelf ? 1 : 0)

    const maxCacheSize = _.includes(['group', 'chatroom'], type) ? WebIM.config.groupMessageCacheSize : WebIM.config.p2pMessageCacheSize
    if (chatData.length > maxCacheSize) {
        const deletedChats = chatData.splice(0, chatData.length - maxCacheSize)
        let byId = state.getIn(['byId'])
        byId = _.omit(byId, _.map(deletedChats, 'id'))
        state = state.setIn(['byId'], byId)
    }

    state = state.setIn([type, chatId], chatData)

    // unread
    const activeContact = _.get(rootState, ['common', 'activeContact'])
    if (!bySelf && !isPushed && message.from !== activeContact) {
        let count = state.getIn(['unread', type, chatId], 0)
        state = state.setIn(['unread', type, chatId], ++count)
    }

    state = state.setIn(['byId', id], {type, chatId})

    return state
}

/**
 * update message status
 * @param state
 * @param message object
 * @param status enum [sending, sent ,fail]
 * @returns {*}
 */
export const updateMessageStatus = (state, {message, status = ''}) => {
    let {id} = message
    if (!id) id = state.getIn(['byMid', message.mid, 'id']) //消息体里根本没有mid ... 也不可能没有id ...
    let mids = state.getIn(['byMid']) || {}
    let mid
    for (var i in mids) {
        console.log('ii', i)
        if (mids[i].id == id) {
            mid = i
        }
    }
    const byId = state.getIn(['byId', id])
    if (!_.isEmpty(byId)) {
        const {type, chatId} = byId
        let messages = state.getIn([type, chatId]).asMutable()
        let found = _.find(messages, {id: parseInt(id)})
        let msg = found.setIn(['status'], status)
        msg = found.setIn(['toJid'], mid)
        messages.splice(messages.indexOf(found), 1, msg)
        AppDB.updateMessageStatus(id, status).then(res => {
        })
        state = state.setIn([type, chatId], messages)
    }
    return state
}

export function sendTxtMessage(chatType, chatId, message = {}) {
    return dispatch => {
        const pMessage = parseFromLocal(chatType, chatId, message, 'txt');
        const {body, id, to} = pMessage;
        const {type, msg} = body;
        const msgObj = new WebIM.message(type, id);
        const chatroom = chatType === 'chatroom';
        // console.log(pMessage)
        msgObj.set({
            msg,
            to,
            roomType: chatroom,
            chatType: 'singleChat',
            success: function () {
                dispatch(updateMessageStatus(pMessage, 'sent'))
            },
            fail: function () {
                dispatch(updateMessageStatus(pMessage, 'fail'))
            }
        });

        if (chatType === 'groupchat' || chatType === 'chatroom') {
            msgObj.setGroup('groupchat')
        }

        WebIM.conn.send(msgObj.body);
        dispatch(addMessage(pMessage, type))
    }
}
