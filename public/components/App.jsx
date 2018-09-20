import React from "react";
import { Link } from 'react-router-dom';

import Content from './Content.jsx';

export default class App extends React.Component {

    constructor(props) {
        super(props);
    
        this.state = {
          mode: 'trian'
        };
    }


    render(){
        return (
            <div>
                <nav class="navbar navbar-expand-lg navbar-dark fixed-top scrolling-navbar">
                    <div class="container">
                        <Link class="navbar-brand" to="/">
                            <strong>Music Genre Classifier</strong>
                        </Link>
                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent-7" aria-controls="navbarSupportedContent-7"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent-7">
                            <ul class="navbar-nav mr-auto">
                                <li class="nav-item ">
                                    <Link class="nav-link" to="/train">Train</Link>
                                </li>
                                <li class="nav-item">
                                    <Link class="nav-link" to="/predict">Predict</Link>
                                </li>
                            </ul>

                        </div>
                    </div>
                </nav>

                <div class='bg'> <Content mode={this.state.mode}/> </div>
            </div>
        );
    }
}