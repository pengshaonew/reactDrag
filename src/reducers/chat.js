import {fromJS} from 'immutable';

export default function chat(state = fromJS({
    byId: {},
    chat: {},
    groupchat: {},
    chatroom: {},
    stranger: {},
    extra: {},
    unread: {
        chat: {},
        groupchat: {},
        chatroom: {},
        stranger: {},
    },
    messageList: [],
    username: '',
    token: '',
    groupInfo:{},
    groupList:[]
}), action) {
    const {type, data} = action;
    switch (type) {
        case 'GET_HISTORY_MESSAGE':
            return state.set('messageList', fromJS(data));
        case 'ADD_MESSAGE':
            let messageListNew=state.get('messageList').push(fromJS(data));
            return state.set('messageList',messageListNew);
        case 'LOGIN_SUCCESS':
            let loginState = state;
            loginState = loginState.set('username', data.username);
            loginState = loginState.set('token', data.token);
            return loginState;
        case 'QUERY_GROUP_INFO':
            return state.set('groupInfo',fromJS(data));
        case 'QUERY_GROUP_LIST':
            let groupState = state;
            groupState = groupState.set('groupList', fromJS(data));
            groupState = groupState.set('groupInfo', fromJS(data[0]||{}));
            return groupState;
        default:
            return state;
    }
}
