import React, {useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import WebIM from '../config/WebIM'
import './chat.css'
import history from '../history'
import Recorder from 'recorder-core'
//需要使用到的音频格式编码引擎的js文件统统加载进来
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
//以上三个也可以合并使用压缩好的recorder.xxx.min.js
//比如 import Recorder from 'recorder-core/recorder.mp3.min' //已包含recorder-core和mp3格式支持
//可选的扩展支持项
import 'recorder-core/src/extensions/waveview'
import axios from "axios";

let Chat = () => {

    const dispatch = useDispatch();
    const thisState = useSelector(state => state.chat, shallowEqual);
    const inputRef = useRef(null);
    const fileRef = useRef(null);

    const messageList = thisState.get('messageList');
    const groupList = thisState.get('groupList');
    const groupInfo = thisState.get('groupInfo');

    const [friendValue, setFriendValue] = useState('');
    const [btnText, setBtnText] = useState('按住说话');
    const [rec, setRec] = useState(null);

    useEffect(() => {
        getGroupList();
        recOpen();
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
                console.log(new Date().getMonth() + ':' + new Date().getMinutes() + '发送成功' + `id：${id}，serverMsgId：${serverMsgId}`);
                dispatch({
                    type: 'ADD_MESSAGE',
                    data: {
                        data: message.msg,
                        id: serverMsgId,
                        to: groupId,
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

    let handleSend = () => {
        inputRef.current.innerHTML && sendTxtMessage({msg: inputRef.current.innerHTML}, groupInfo.get('groupid'));
        inputRef.current.innerHTML = "";
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

    // 撤回
    let revocation = record => {
        WebIM.conn.recallMessage({
            mid: record.id,
            to: record.to,
            type: 'groupchat'
        })
    };

    // 发送图片消息
    let sendPrivateUrlImg = function () {
        let id = WebIM.conn.getUniqueId();                   // 生成本地消息id
        let msg = new WebIM.message('img', id);        // 创建图片消息
        let file = WebIM.utils.getFileUrl(fileRef.current);      // 将图片转化为二进制文件
        let allowType = {
            'jpg': true,
            'gif': true,
            'png': true,
            'bmp': true
        };
        if (file.filetype.toLowerCase() in allowType) {
            let option = {
                apiUrl: WebIM.config.apiURL,
                file: file,
                to: groupInfo.get('groupid'),                       // 接收消息对象
                roomType: false,
                chatType: 'chatroom',
                onFileUploadError: function () {      // 消息上传失败
                    console.log('onFileUploadError');
                },
                onFileUploadComplete: function (res) {   // 消息上传成功
                    console.log('上传成功', res);
                    dispatch({
                        type: 'ADD_MESSAGE',
                        data: {
                            data: "",
                            id: id,
                            to: groupInfo.get('groupid'),
                            type: "groupchat",
                            msgType: 'img',
                            url: `${res.uri}/${res.entities[0].uuid}`,
                        }
                    })
                },
                success: function (res) {                // 消息发送成功
                    console.log('发送群组图片消息成功', res);
                },
                fail: function () {
                    console.log('发送失败');
                },
                flashUpload: WebIM.flashUpload
            };
            console.log('option',option);
            msg.set(option);
            msg.setGroup('groupchat');
            WebIM.conn.send(msg.body);
        }
    };

    // 发送语音消息
    let sendAudio = function (fileObj) {
        let id = WebIM.conn.getUniqueId();                   // 生成本地消息id
        let msg = new WebIM.message('audio', id);        // 创建语音消息
        let file = WebIM.utils.getFileUrl(fileObj || fileRef.current);      // 将音频转化为二进制文件

        let option = {
            apiUrl: WebIM.config.apiURL,
            file: file,
            to: groupInfo.get('groupid'),                       // 接收消息对象
            roomType: false,
            chatType: 'chatroom',
            onFileUploadError: function () {      // 消息上传失败
                console.log('onFileUploadError');
            },
            onFileUploadComplete: function (res) {   // 消息上传成功
                console.log('上传成功', res);
                /*dispatch({
                    type: 'ADD_MESSAGE',
                    data: {
                        data: "",
                        id: id,
                        to: groupInfo.get('groupid'),
                        type: "groupchat",
                        msgType: 'audio',
                        url: `${res.uri}/${res.entities[0].uuid}`,
                    }
                })*/
            },
            success: function (res) {                // 消息发送成功
                console.log('发送群组音频消息成功', res);
            },
            fail: function () {
                console.log('发送失败');
            },
            flashUpload: WebIM.flashUpload
        };
        msg.set(option);
        msg.setGroup('groupchat');
        console.log(msg.body);
        WebIM.conn.send(msg.body);
    };

    let clickImg = (e) => {
        document.execCommand('InsertImage', true, e.target.src);
    };

    let recOpen = (success) => {//一般在显示出录音按钮或相关的录音界面时进行此方法调用，后面用户点击开始录音时就能畅通无阻了
        let rec = Recorder({
            type: "mp3", sampleRate: 16000, bitRate: 16 //mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
            , onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate) => {
                //录音实时回调，大约1秒调用12次本回调
            }
        });

        //var dialog=createDelayDialog(); 我们可以选择性的弹一个对话框：为了防止移动端浏览器存在第三种情况：用户忽略，并且（或者国产系统UC系）浏览器没有任何回调，此处demo省略了弹窗的代码
        rec.open(() => {//打开麦克风授权获得相关资源
            console.log('46open');
            success && success(rec)
            //dialog&&dialog.Cancel(); 如果开启了弹框，此处需要取消
            //rec.start() 此处可以立即开始录音，但不建议这样编写，因为open是一个延迟漫长的操作，通过两次用户操作来分别调用open和start是推荐的最佳流程

        }, (msg, isUserNotAllow) => {//用户拒绝未授权或不支持
            //dialog&&dialog.Cancel(); 如果开启了弹框，此处需要取消
            console.log((isUserNotAllow ? "UserNotAllow，" : "") + "无法录音:" + msg);
        });
        setRec(rec)
    };

    let onTouchStart = () => {//打开了录音后才能进行start、stop调用
        if (!rec) {
            recOpen(recNew => {
                recNew.start();
            })
        } else {
            rec.start();
        }
        setBtnText('松开结束');
    };

    let onTouchEnd = () => {
        rec && rec.stop((blob, duration) => {
            console.log(blob, window.URL.createObjectURL(blob), "时长:" + duration + "ms");
            rec.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
            setRec(null);
            setBtnText('按住说话');
            //已经拿到blob文件对象想干嘛就干嘛：立即播放、上传

            let name = new Date().getTime();
            var downA = document.createElement("A");
            downA.innerHTML = "下载 " + name;
            downA.href = window.URL.createObjectURL(blob);
            downA.download = name;
            document.body.appendChild(downA);
            let form = new FormData(); // 创建form对象

            var audio = document.createElement("audio");
            audio.controls = true;
            document.body.appendChild(audio);
            //简单利用URL生成播放地址，注意不用了时需要revokeObjectURL，否则霸占内存
            audio.src = (window.URL).createObjectURL(blob);

            form.append('file', blob, 'recorder.mp3'); // 将文件存入file下面
            let config = {
                // 配置请求头
                headers: {'Content-Type': 'multipart/form-data'}
            };
            axios.post(`/weChat-hc-war/marketing/uploadFile7011`, form, config).then(res => {
                return res.data;
            }).then(response => {
                console.log(response);
            })
            // sendAudio(form);
        }, msg => {
            console.log("录音失败:" + msg);
            rec.close();//可以通过stop方法的第3个参数来自动调用close
            setRec(null);
        });
    };

    let openPhoto = e => {
        console.log(fileRef.current);
        fileRef.current.click()
    };

    return (
        <div>
            <div>
                <a onClick={() => history.push('/demo')}>demo</a>
            </div>
            <div className="footer">
                <div ref={inputRef} contentEditable="true" style={{border: '2px solid #ccc', minHeight: 32}}
                     id={'inputChat'}/>
                <button className="btn" onClick={handleSend}>发送文本</button>
                <button className="btn" onClick={() => sendAudio()}>发送语音</button>
                <button className="btn" onClick={sendPrivateUrlImg}>发送图片</button>
                <input type="file" name="filename" ref={fileRef} />
                <span onClick={openPhoto}>打开文件</span>
                {/*<button className="send" onClick={createGroup}>创建群组</button>*/}
                <div
                    onClick={onTouchStart}
                    /*onTouchStart={onTouchStart}
                    onTouchMove={onTouchEnd}
                    onTouchEnd={onTouchEnd}*/
                    style={{
                        width: 100,
                        height: 25,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        appearance: 'button',
                        '-webkit-appearance': 'button'
                    }}
                >{btnText}</div>
                <button
                    onClick={onTouchEnd}>结束
                </button>
            </div>
            {/*<h3>添加好友</h3>
            <Input type="text" value={friendValue} onChange={changeFriend}
                   onPressEnter={addGroupMembers}/>
            <button className="send" onClick={addGroupMembers}>加好友入群</button>*/}
            <img src="https://www.baidu.com/img/bd_logo1.png" alt="" width={100} onClick={clickImg}/>
            <div style={{borderBottom: '2px solid #333'}}>消息列表</div>
            <div>
                {
                    (messageList.reverse()).map((item, index) => {
                        switch (item.get('msgType')) {
                            case 'img':
                                return (
                                    <div key={index}>
                                        <img key={index} src={item.get('url')} alt="" width={80} height={80}/>
                                    </div>
                                );
                            case 'audio':
                                return (
                                    <div key={index}>
                                        <audio key={index} src={item.get('url')} controls={'controls'}>音频</audio>
                                    </div>
                                );
                            default:
                                return <div key={index} onClick={() => revocation(item.toJS())}
                                            dangerouslySetInnerHTML={{__html: item.get('data')}} id={'richText'}/>
                        }
                    })
                }
            </div>
        </div>
    )
};
export default Chat;
