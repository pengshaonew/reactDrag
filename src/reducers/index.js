import { combineReducers } from 'redux';
import chat from './chat';

const appReducer = combineReducers({
    chat,
});

const rootReducer = (state, action) => {
    return appReducer(state, action);
};
export default rootReducer;
