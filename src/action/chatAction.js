import WebIM from '../config/WebIM'
import {shallowEqual, useDispatch, useSelector} from 'react-redux';

export function sendTxtMessage( message = {},groupId) {
    var id = WebIM.conn.getUniqueId();            // 生成本地消息id
    var msg = new WebIM.message('txt', id); // 创建文本消息
    var option = {
        msg: message.msg,             // 消息内容
        to: groupId,                     // 接收消息对象(群组id)
        roomType: false,                    // 群聊类型，true时为聊天室，false时为群组
        ext: {},                            // 扩展消息
        success: function () {
            getHistory(groupId)
        },                                  // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
        fail: function () {

        }                                   // 对失败的相关定义，sdk会将消息id登记到日志进行备份处理
    };
    msg.set(option);
    msg.setGroup('groupchat');              // 群聊类型
    WebIM.conn.send(msg.body);
    console.log(msg.body);
    return {
        type:"ADD_MESSAGE",
        data:{msg}
    }
}
export function getHistory(groupId) {
    /**
     * 获取对话历史消息
     * @param {Object} options
     * @param {String} options.queue   - 对方用户id（如果用户id内含有大写字母请改成小写字母）/群组id/聊天室id
     * @param {String} options.count   - 每次拉取条数
     * @param {Boolean} options.isGroup - 是否是群聊，默认为false
     * @param {Function} options.success
     * @param {Funciton} options.fail
     */
    const dispatch = useDispatch();
    let options = {
        queue: groupId,
        isGroup: true,
        count: 10,
        success: function(res){
            if(res.length){
                dispatch({
                    type:'ADD_MESSAGE',
                    data:res
                })
            }
        },
        fail: function(){}
    };
    WebIM.conn.fetchHistoryMessages(options);
}
