/**
 * Created by lwj on 2017/5/15.
 */
import { createBrowserHistory, createHashHistory } from '../node_modules/history';
import { Modal } from 'antd';

let history = null;
if (window.electron) {
    history = createHashHistory({
        getUserConfirmation(message, callback) {
            Modal.confirm({
                title: '确认要离开吗',
                content: message,
                onOk() {
                    callback(true);
                },
                onCancel() {
                    callback(false);
                }
            });
        }
    });
} else {
    history = createBrowserHistory({
        getUserConfirmation(message, callback) {
            Modal.confirm({
                title: '确认要离开吗',
                content: message,
                onOk() {
                    callback(true);
                },
                onCancel() {
                    callback(false);
                }
            });
        }
    });
}

export default history;
