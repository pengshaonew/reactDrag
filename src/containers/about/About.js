import React, {memo} from 'react';
import {areEqual} from 'react-window';
import '../common.css';

let About = props => {

    const {history} = props;

    let startChat = () => {
        window.mantis.requestChat()
    }

    let goRoute = () => {
        history.push('/home')
    }
    return (
        <div>
            <div className="navBox">
                <div className={'nav'} onClick={goRoute}>首页</div>
                <div className={'nav navActive'}>关于我们</div>
            </div>
            <div onClick={startChat}>
                关于我们内容
            </div>
        </div>
    )
}

export default memo(About, areEqual);