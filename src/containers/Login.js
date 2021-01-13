import React, {Component, useCallback, useEffect, useState} from 'react';
import {Input, Button} from 'antd';
import history from '../history'

const LibGenerateTestUserSig = window.LibGenerateTestUserSig;
let Login = () => {
    const [username, setUsername] = useState("");

    useEffect(() => {
        // 监听事件，例如：
        window.tim.on(window.TIM.EVENT.SDK_READY, function (event) {
            // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
            // event.name - TIM.EVENT.SDK_READY
            console.log(22, event);
        });
    }, []);

    let changeUser = e => {
        setUsername(e.target.value);
    };

    let handleLogin = useCallback(() => {
        window.tim.login({userID: username, userSig: genTestUserSig(username).userSig}).then(res => {
            addGroup();
            // history.push('/chat');
        });
    }, [username]);

    let addGroup = () => {
        let promise = window.tim.joinGroup({groupID: '1118', type: window.TIM.TYPES.GRP_MEETING});
        promise.then(function (imResponse) {
            switch (imResponse.data.status) {
                case window.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
                    console.log('等待管理员同意');
                    break;
                case window.TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
                    console.log('加群成功',imResponse.data.group); // 加入的群组资料
                    break;
                case window.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
                    console.log('已经在群中');
                    break;
                default:
                    break;
            }
        }).catch(function (imError) {
            console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
        });
    };

    let genTestUserSig = useCallback((userID) => {
        let SDKAPPID = 1400473583;

        /**
         * 签名过期时间，建议不要设置的过短
         * <p>
         * 时间单位：秒
         * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
         */
        let EXPIRETIME = 604800;

        /**
         * 计算签名用的加密密钥，获取步骤如下：
         *
         * step1. 进入腾讯云实时音视频[控制台](https://console.cloud.tencent.com/rav )，如果还没有应用就创建一个，
         * step2. 单击“应用配置”进入基础配置页面，并进一步找到“帐号体系集成”部分。
         * step3. 点击“查看密钥”按钮，就可以看到计算 UserSig 使用的加密的密钥了，请将其拷贝并复制到如下的变量中
         *
         * 注意：该方案仅适用于调试Demo，正式上线前请将 UserSig 计算代码和密钥迁移到您的后台服务器上，以避免加密密钥泄露导致的流量盗用。
         * 文档：https://cloud.tencent.com/document/product/647/17275#Server
         */
        let SECRETKEY = 'b20d5b7a6d42ee0dfe2b7a4b444958720cb183308b7083abc9fdd492ffc578b2';

        let generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME);
        let userSig = generator.genTestUserSig(userID);
        return {
            SDKAppID: SDKAPPID,
            userSig: userSig
        };
    }, []);

    return (
        <div style={{
            width: 300,
            margin: "50px auto"
        }}>
            <div>
                <Input type="text" placeholder={'请输入用户名'} onChange={changeUser} onPressEnter={handleLogin}/>
                <Button onClick={handleLogin} style={{width: 80, height: 32, marginRight: 10}}
                        type={'primary'}>登录</Button>
            </div>
        </div>
    )
};
export default Login;
