import React from "react";
import { Switch, Route } from 'react-router-dom'

import Train from './Train.jsx';
import Predict from './Predict';

export default class Content extends React.Component {
    render(){
        return (

                <div class='vertical-center'>
                    <div class='container'>
                    <div class='row justify-content-center'>
                        <div class='col-8'>
                                <Switch>
                                    <Route exact path='/train' component={Train} />
                                    <Route exact path='/predict' component={Predict} />
                                </Switch>
                        </div>
                    </div>
                    </div>
                </div>

        );
    }
}