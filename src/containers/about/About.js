import React, {memo, useEffect, useState} from 'react';
import {areEqual} from 'react-window';
import '../common.css';

let About = props => {

    const {history} = props;

    let goRoute = () => {
        history.push('/home')
    }
    return (
        <div>
            <div className="navBox">
                <div className={'nav'} onClick={goRoute}>首页</div>
                <div className={'nav navActive'}>关于我们</div>
            </div>
            <div>
                关于我们内容
            </div>
        </div>
    )
}

export default memo(About, areEqual);