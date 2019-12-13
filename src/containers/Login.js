import React, {Component, useEffect, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import WebIM from '../config/WebIM'
import {Input,Button} from 'antd'

let Login = () => {
    const dispatch = useDispatch();
    const [username, setUsername] = useState("");

    let changeUser = e => {
        setUsername(e.target.value);
    };

    let handleRegister = () => {
        WebIM.conn.registerUser({
            username: username,
            password: '123123',
            nickname: username,
            appKey: WebIM.config.appkey,
            success: function (e) {
                console.log(e);
            },
            error: function () {
            },
            apiUrl: WebIM.config.apiURL
        });
    };

    let handleLogin = () => {
        WebIM.conn.open({
            apiUrl: WebIM.config.apiURL,
            user: username,
            pwd: '123123',
            appKey: WebIM.config.appkey,
            success(token) {
                dispatch({
                    type: "LOGIN_SUCCESS",
                    data: {
                        username, token
                    }
                })
            },
            error: e => {
                alert('登录失败');
            }
        });
    };

    return (
        <div style={{
            width: 300,
            margin: "50px auto"
        }}>
            <div>
                <Input type="text" placeholder={'请输入用户名'} onChange={changeUser} onPressEnter={handleLogin}/>
            </div>
            <div style={{}}>
                <Button onClick={handleLogin} style={{marginRight: 10}} type={'primary'}>登录</Button>
                <Button onClick={handleRegister}>注册</Button>
            </div>
        </div>
    )
};

export default Login;
