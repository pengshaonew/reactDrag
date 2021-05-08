import React from 'react';
import './App.css';
import Main from "./containers/Main";
import {Route, Router} from 'react-router-dom';
import { createBrowserHistory } from '../node_modules/history';

const history = createBrowserHistory();

function App() {
    return (
        <div className="App">
            <Router history={history}>
                <Route path={'/'} render={props => <Main {...props}/>}/>
            </Router>
        </div>
    );
}

export default App;
