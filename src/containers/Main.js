import React, {memo, useEffect, useState} from 'react';
import {areEqual} from 'react-window';
import {Route, Switch} from "react-router-dom";
import Home from "./Home/Home";
import Demo from "./Demo";
import About from "./about/About";

let Main = () => {

    return (
        <div>
            <Route path={'/home'} render={props => <Home {...props} />}/>
            <Route path={'/about'} render={props => <About {...props} />}/>
            <Route path={'/demo'} render={props => <Demo {...props} />}/>
        </div>
    )
}

export default memo(Main, areEqual);