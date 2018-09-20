import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';

import {myDataset} from "./scripts/data.js";        // load dataset class
import * as myModel from "./scripts/model.js";    // load loadMobilenet(), train()

import './styles.css';


window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
myModel.loadMobileNet();  // load the truncated mobilenet
myDataset.loadSongs();  // fetch songs from backend and add them to datast.songsArr[]




ReactDOM.render(
    <BrowserRouter>
      <App/>
    </BrowserRouter>,
    document.getElementById('app')
);

