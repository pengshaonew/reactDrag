import React, {useCallback, useEffect, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
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
import {Button} from "antd";
import Login from "./Login";
import {fromJS} from "immutable";

let Chat = () => {
    const tim = window.tim;
    const TIM = window.TIM;
    const inputRef = useRef(null);
    const fileRef = useRef(null);

    const [btnText, setBtnText] = useState('按住说话');
    const [rec, setRec] = useState(null);
    const [curMsg, setCurMsg] = useState(null);
    const [msgList, setMsgList] = useState([]);

    useEffect(() => {
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, receiveMsg);
    }, []);

    // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
    let receiveMsg = e => {
        // event.name - TIM.EVENT.MESSAGE_RECEIVED
        // event.data - 存储 Message 对象的数组 - [Message]
        console.log(Date.now(), e.data);
        if (e.data[0].type === "TIMTextElem") {
            let msgListNew = msgList.concat(e.data);
            setMsgList(msgListNew);
        }
    };

    let getGroupList = () => {

    };

    let getHistoryMsg = (groupId) => {

    };

    let handleSend = (message) => {
        // 2. 发送消息
        let promise = tim.sendMessage(message);
        promise.then(function (imResponse) {
            // 发送成功
            console.log('消息发送成功', imResponse);
            setCurMsg(imResponse.data.message);
        }).catch(function (imError) {
            // 发送失败
            console.warn('sendMessage error:', imError);
        });
    };

    // 发送文字消息
    let sendTxtMessage = function () {
        // 1. 创建消息实例，接口返回的实例可以上屏
        let message = tim.createTextMessage({
            to: '1118',
            conversationType: TIM.TYPES.CONV_GROUP,
            // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
            // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
            // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
            payload: {
                text: inputRef.current.innerHTML
            }
        });
        handleSend(message);
    };

    //  canvas压缩图片
    let canvasDrawImg = (url, callback) => {
        let img = new Image();
        if (/(probe\.bjmantis\.net)|(mantisfiles\.bjmantis\.net)/.test(url)) {
            img.setAttribute('crossOrigin', 'Anonymous');
            img.src = url + '?' + Date.now();
        } else {
            img.src = url;
        }
        img.onload = function () {
            // 当图片宽度超过 400px 时, 就压缩成 400px, 高度按比例计算
            // 压缩质量可以根据实际情况调整
            // let w = Math.min(100, img.width);
            // let h = img.height * (w / img.width);
            let w = img.width;
            let h = img.height;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            // 设置 canvas 的宽度和高度
            canvas.width = w;
            canvas.height = h;

            // 把图片绘制到 canvas 中
            ctx.drawImage(img, 0, 0, w, h);

            // 取出 base64 格式数据
            let dataURL = canvas.toDataURL('image/png');
            callback && callback(dataURL);
        };
    };

    // base64转文件对象
    let dataURLtoFile = (dataurl, filename) => {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    };

    // 发送快捷图片消息或素材
    let sendPrivateUrlImg = function () {
        canvasDrawImg('https://probe.bjmantis.net/msp/front/8888/8888_menu_title_big_logo.png', dataURL => {
            let file = dataURLtoFile(dataURL, 'logo.png');
            sendPrivateImg(file);
        });
    };
    // 发送图片消息
    let sendPrivateImg = function (file) {
        let message = tim.createImageMessage({
            to: '1118',
            conversationType: TIM.TYPES.CONV_GROUP,
            // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考 消息优先级与频率控制
            // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
            // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
            payload: {
                file: file,
            },
            onProgress: function (event) {
                console.log('file uploading:', event)
            }
        });
        handleSend(message);
    };
    // 发送语音消息
    let sendAudio = function (fileObj) {

    };

    // 撤回
    let revocation = () => {
        let message = tim.createCustomMessage({
            to: '1118',
            conversationType: TIM.TYPES.CONV_GROUP,
            // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考 消息优先级与频率控制
            // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
            // priority: TIM.TYPES.MSG_PRIORITY_HIGH,
            payload: {
                data: 'recall',  // recall txt img audio video @
                description: '撤回',
                extension: JSON.stringify({
                    msgId: curMsg.sequence,
                    content:'',
                })
            }
        });
        handleSend(message);
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

    let fileChange = (e) => {
        sendPrivateImg(e.currentTarget.files[0]);
    };

    let createGroup = useCallback(() => {
        tim.createGroup({
            name: '少鹏测试群3',
            type: TIM.TYPES.GRP_AVCHATROOM,
            groupID: '1118'
        })
    }, []);

    return (
        <div>
            <Login/>
            <div>
                <a onClick={() => history.push('/login')}>去登录</a>
                <Button onClick={getGroupList} style={{minWidth: 80, height: 32, marginRight: 10}}
                        type={'primary'}>获取群组列表</Button>
                {/*<Button onClick={createGroup} style={{minWidth: 80, height: 32,marginRight:10}} type={'primary'}>创建群组</Button>*/}
            </div>
            <div className="footer">
                <div ref={inputRef} contentEditable="true" style={{border: '2px solid #ccc', minHeight: 32}}
                     id={'inputChat'}/>
                <button className="btn" onClick={sendTxtMessage}>发送文本</button>
                {/*<button className="btn" onClick={() => sendAudio()}>发送语音</button>*/}
                <button className="btn" onClick={sendPrivateUrlImg}>发送图片</button>
                <button className="btn" onClick={revocation}>撤回</button>
                <input type="file" name="filename" ref={fileRef} onChange={fileChange}/>
                {/*<span onClick={openPhoto}>打开文件</span>*/}
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
                    }}
                >{btnText}</div>
                <button
                    onClick={onTouchEnd}>结束
                </button>
            </div>
            <img src="https://www.baidu.com/img/bd_logo1.png" alt="" width={100} onClick={clickImg} id='imgDom'/>
            <div style={{borderBottom: '2px solid #333'}}>消息列表</div>
            {
                msgList.map((item, index) => {
                    return (
                        <div key={index}>
                            {item.payload.text}
                            <button className="btn" onClick={() => revocation(item)}>撤回</button>
                        </div>
                    )
                })
            }
        </div>
    )
};
export default Chat;
