import React, {useEffect} from 'react';
import './App.css';
import {Router, Link, Redirect, Route, Switch} from 'react-router-dom';
import Demo from "./containers/Demo";
import Chat from "./containers/Chat";
import Login from "./containers/Login";
import history from './history'

function App() {

    return (
        <Router history={history}>
            <div style={{height: '100%', width: '100%'}}>
                <Route exact path="/" component={Chat}/>
                <Route path="/login" component={Login}/>
                <Route path="/chat" component={Chat}/>
                <Route path="/demo" component={Demo}/>
            </div>
        </Router>
    );
}

export default App;
