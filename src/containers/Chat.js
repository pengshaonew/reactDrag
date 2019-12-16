import React, {useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Input} from 'antd';
import WebIM from '../config/WebIM'

let Chat = () => {

    const dispatch = useDispatch();
    const thisState = useSelector(state => state.chat, shallowEqual);

    const messageList = thisState.get('messageList');
    const groupList = thisState.get('groupList');
    const groupInfo = thisState.get('groupInfo');

    const [value, setValue] = useState('');
    const [friendValue, setFriendValue] = useState('');

    useEffect(() => {
        getGroupList();
    }, []);

    useEffect(() => {
        if (groupInfo.size) {
            getHistoryMsg(groupInfo.get('groupid'));
        }
    }, [groupInfo]);

    let getGroupList = () => {
        let options = {
            success: function (resp) {
                dispatch({
                    type: 'QUERY_GROUP_LIST',
                    data: resp.data
                })
            },
            error: function (e) {
            }
        };
        WebIM.conn.getGroup(options);
    };

    let createGroup = () => {
        let options = {
            data: {
                groupname: '测试1群',                    // 群组名
                desc: '本地测试',                          // 群组描述
                members: ['zsptest'],            // 用户名组成的数组
                public: true,                         // pub等于true时，创建为公开群
                approval: false,                  // approval为true，加群需审批，为false时加群无需审批
                allowinvites: true
            },
            success: function (respData) {
                dispatch({
                    type: 'QUERY_GROUP_INFO',
                    data: respData.data
                })
            },
            error: function () {
            }
        };
        WebIM.conn.createGroupNew(options);
    };

    let sendTxtMessage = (message = {}, groupId) => {
        let id = WebIM.conn.getUniqueId();            // 生成本地消息id
        let msg = new WebIM.message('txt', id); // 创建文本消息
        let option = {
            msg: message.msg,             // 消息内容
            to: groupId,                     // 接收消息对象(群组id)
            roomType: false,                    // 群聊类型，true时为聊天室，false时为群组
            ext: {},                            // 扩展消息
            success: function (id, serverMsgId) {
                setValue('');
                console.log(new Date().getMonth() + ':' + new Date().getMinutes() + '发送成功'+`id：${id}，serverMsgId：${serverMsgId}`);
                dispatch({
                    type:'ADD_MESSAGE',
                    data:{
                        data: message.msg,
                        id: 682556906564225096,
                        to: 101794878390273,
                        type: "groupchat",
                    }
                })
            },                                  // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
            fail: function () {

            }                                   // 对失败的相关定义，sdk会将消息id登记到日志进行备份处理
        };
        msg.set(option);
        msg.setGroup('groupchat');              // 群聊类型
        WebIM.conn.send(msg.body);
    };

    let getHistoryMsg = (groupId) => {
        /**
         * 获取对话历史消息
         * @param {Object} options
         * @param {String} options.queue   - 对方用户id（如果用户id内含有大写字母请改成小写字母）/群组id/聊天室id
         * @param {String} options.count   - 每次拉取条数
         * @param {Boolean} options.isGroup - 是否是群聊，默认为false
         * @param {Function} options.success
         * @param {Funciton} options.fail
         */
        let options = {
            queue: groupId,
            isGroup: true,
            count: 100,
            success: function (res) {
                if (res.length) {
                    dispatch({
                        type: 'GET_HISTORY_MESSAGE',
                        data: res
                    })
                }
            },
            fail: function () {
            }
        };
        WebIM.conn.fetchHistoryMessages(options);
    };

    let changeMsg = e => {
        setValue(e.target.value);
    };


    let handleSend = () => {
        value && sendTxtMessage({msg: value}, groupInfo.get('groupid'));
    };

    let changeFriend = e => {
        setFriendValue(e.target.value)
    };

    let handleAddFriend = () => {
        friendValue && WebIM.conn.subscribe({
            to: friendValue,
            message: '加个好友呗!'
        });
    };

    // 加好友入群
    let addGroupMembers = function () {
        let option = {
            users: [friendValue],
            groupId: groupInfo.get('groupid')
        };
        WebIM.conn.inviteToGroup(option);
    };

    let revocation = record => {
        WebIM.conn.recallMessage({
            mid:record.id,
            to:record.to,
            type:'groupchat'
        })
    };
    return (
        <div>
            <div className="footer">
                <Input type="text" value={value} onChange={changeMsg}
                       onPressEnter={handleSend}/>
                <button className="send" onClick={handleSend}>send</button>
                {/*<button className="send" onClick={createGroup}>创建群组</button>*/}
            </div>
            {/*<h3>添加好友</h3>
            <Input type="text" value={friendValue} onChange={changeFriend}
                   onPressEnter={addGroupMembers}/>
            <button className="send" onClick={addGroupMembers}>加好友入群</button>*/}
            <div>
                {
                    (messageList.reverse()).map((item, index) => {
                        return <div key={index} onClick={() => revocation(item.toJS())}>{item.get('data')}</div>
                    })
                }
            </div>
        </div>
    )
};
export default Chat;
