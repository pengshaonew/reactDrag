import React, {memo, useEffect, useState} from 'react';
import {areEqual} from 'react-window';
import '../common.css';

let Home = props => {

    const {history} = props;

    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        arrayData();
    },[])

    let arrayData = () => {
        let dataListNew = [];
        for (let i = 0; i < 20; i++) {
            dataListNew.push(i);
        }
        setDataList(dataListNew);
    }

    let startChat = () => {
        window.mantis.requestChat()
    }

    let goRoute = () => {
        history.push('/about')
    }
    return (
        <div>
            <div className="navBox">
                <div className={'nav navActive'}>首页</div>
                <div className={'nav'} onClick={goRoute}>关于我们</div>
            </div>
            <ul onClick={startChat}>
                {
                    dataList.map((item, index) => {
                        return (
                            <li key={index}>点击发起聊天第{item}个按钮</li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default memo(Home, areEqual);