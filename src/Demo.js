import React, {Component} from 'react';
import "./demo.css"

class Demo extends Component {
    constructor() {
        super();
        this.state = {
            list: [
                {id: 0, value: "1"},
                {id: 1, value: "2"},
                {id: 2, value: "3"},
                {id: 3, value: "4"},
                {id: 4, value: "5"},
                {id: 5, value: "6"}
            ],
            sourceIndex: null,
        }
    }

    dragStart = (e, sourceIndex) => {
        this.setState({
            sourceIndex
        })
    };

    onDragOver = (e) => {
        //此方法不可动，否则无法调起onDrop
        e.preventDefault();
    };

    drop = (e, targetIndex) => {  //释放源时触发
        let {list, sourceIndex} = this.state;
        let listNew = [...list];
        if (sourceIndex === targetIndex) return;
        let isUp = targetIndex < sourceIndex;
        listNew.splice(isUp ? targetIndex : targetIndex + 1, 0, listNew[sourceIndex]);
        listNew.splice(isUp ? sourceIndex + 1 : sourceIndex, 1);
        this.setState({
            list: listNew
        })
    };

    render() {
        const {list} = this.state;
        return (
            <div>
                <ul>
                    {
                        list.map((item, index) => {
                            return (
                                <li key={index}
                                    draggable={true}
                                    onDrop={(e) => this.drop(e, index)}
                                    onDragStart={(e) => this.dragStart(e, index)}
                                    onDragOver={(e) => this.onDragOver(e)}>{item.value}</li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default Demo;
