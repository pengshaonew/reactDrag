import React, {Component} from 'react';
import axios from "axios";
import "./demo.css"
import Recorder from 'recorder-core'
//需要使用到的音频格式编码引擎的js文件统统加载进来
import 'recorder-core/src/engine/mp3'
import 'recorder-core/src/engine/mp3-engine'
//以上三个也可以合并使用压缩好的recorder.xxx.min.js
//比如 import Recorder from 'recorder-core/recorder.mp3.min' //已包含recorder-core和mp3格式支持
//可选的扩展支持项
import 'recorder-core/src/extensions/waveview'

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
            name: 123,
            rec:null
        }
    }

    componentDidMount() {
        this.getData();
        this.recOpen();
    }

    recOpen = (success) =>{//一般在显示出录音按钮或相关的录音界面时进行此方法调用，后面用户点击开始录音时就能畅通无阻了
        let rec=Recorder({
            type:"mp3",sampleRate:16000,bitRate:16 //mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
            ,onProcess:function(buffers,powerLevel,bufferDuration,bufferSampleRate){
                //录音实时回调，大约1秒调用12次本回调
            }
        });

        //var dialog=createDelayDialog(); 我们可以选择性的弹一个对话框：为了防止移动端浏览器存在第三种情况：用户忽略，并且（或者国产系统UC系）浏览器没有任何回调，此处demo省略了弹窗的代码
        rec.open(function(){//打开麦克风授权获得相关资源
            //dialog&&dialog.Cancel(); 如果开启了弹框，此处需要取消
            //rec.start() 此处可以立即开始录音，但不建议这样编写，因为open是一个延迟漫长的操作，通过两次用户操作来分别调用open和start是推荐的最佳流程


        },function(msg,isUserNotAllow){//用户拒绝未授权或不支持
            //dialog&&dialog.Cancel(); 如果开启了弹框，此处需要取消
            console.log((isUserNotAllow?"UserNotAllow，":"")+"无法录音:"+msg);
        });
        this.setState({rec}, () => success && success(rec));
    };

    recStart = () => {//打开了录音后才能进行start、stop调用
        let {rec} = this.state;
        if(!rec){
            this.recOpen(recNew=>{
               setTimeout(()=>{
                   recNew.start();
               },1000)
            })
        }else{
            rec.start();
        }
    };

    recStop = () => {
        let {rec} = this.state;
        let _this = this;
        rec.stop(function(blob,duration){
            console.log(blob,(window.URL).createObjectURL(blob),"时长:"+duration+"ms");
            rec.close();//释放录音资源，当然可以不释放，后面可以连续调用start；但不释放时系统或浏览器会一直提示在录音，最佳操作是录完就close掉
            _this.setState({rec:null});

            //已经拿到blob文件对象想干嘛就干嘛：立即播放、上传

            /*立即播放例子*/
            var audio=document.createElement("audio");
            audio.controls=true;
            document.body.appendChild(audio);
            //注意不用了时需要revokeObjectURL，否则霸占内存
            audio.src=(window.URL).createObjectURL(blob);
            audio.play();
        },function(msg){
            console.log("录音失败:"+msg);
            rec.close();//可以通过stop方法的第3个参数来自动调用close
            _this.setState({rec})
        });
    };

    uploading=()=>{
        let rec = Recorder();
        rec.open(function () {
            rec.start();
            setTimeout(function () {
                rec.stop(function (blob, duration) {
                //录音结束时拿到了blob文件对象，可以用FileReader读取出内容，或者用FormData上传
                    let formData = new FormData();
                    formData.append('file', blob);

                }, function (msg) {
                    console.log("录音失败:" + msg);
                });
            }, 3000);
        }, function (msg) {
            console.log("无法录音:" + msg);
        });
    };


    getData = () => {
        /*fetch(`${window.location.origin}/manifest.json`).then(res => res.json()).then(response => {
            this.setState({name: response.name});
        })*/
        axios.get(`${window.location.origin}/manifest.json`).then(res=>{
            return res.data;
        }).then(response => {
            this.setState({name: response.name});
        })
    };

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
        const {list, name} = this.state;
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
                <div>{name}</div>
                <div>
                    <button onClick={this.recStart}>开始</button>
                    <button onClick={this.recStop}>结束</button>
                    <button onClick={this.uploading}>上传</button>
                </div>
            </div>
        )
    }
}

export default Demo;
