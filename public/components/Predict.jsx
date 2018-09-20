
import React, { Component } from 'react';

import {GENRES} from '../scripts/config';

import * as myModel from '../scripts/model';
import {myDataset} from '../scripts/data';
import * as myAudio from '../scripts/audio';
import { listenerCount } from 'cluster';


export default class Predict extends Component {


    constructor(props) {
        super(props);

        this.state = {
            phase: 'pending',
            onplayPredId: -1,
            resultId: 0,
            confidence: 0,
        }

        this.record = this.record.bind(this);
        this.stop = this.stop.bind(this);
        this.file = this.file.bind(this);
        this.setEnded = this.setEnded.bind(this);
        this.setOnplayPred = this.setOnplayPred.bind(this);
    }

    render() {
        let sticker;
        if (this.state.phase === 'pending') {
            sticker = null;
        }
        else if (this.state.phase === 'onplay') {
            let content;
            if(this.state.onplayPredId === -1) {
                content = 'Let me listen...';
            }else {
                content = `Sounds Like ${GENRES[this.state.onplayPredId]}!`;
            }
            sticker = (
                <div>
               
                        <h4 align="center">
                            {content}
                        </h4>
     
                   
                    <div class='row justify-content-center align-items-center'>
                        <div class='col-6 text-center'>
                            <canvas  id="visualizer" width="300" height="150"></canvas>
                        </div>
                    </div>
                </div>
            )
        }
        else if (this.state.phase === 'ended') {

            sticker = <h4 align="center">The song is {GENRES[this.state.resultId]}!</h4>
        }

        return (
            <div>
                {
                    sticker
                }

                <div class='row'>
         
                    <button class='col btn btn-outline-white' id="Record" onClick={this.record} >Record</button>

                    <button class='col btn btn-outline-white' id="Stop" onClick={this.stop}>Stop</button>

                    <label class="col btn btn-outline-white">
                        Browse
                        <input type="file" style={{ display: 'none' }} id="fileInputs" multiple onChange={(e) => this.file(e.target.files)} />
                    </label>
                </div>
               
            </div>
        );
    }
 
    record() {
        this.setState({phase: 'onplay'}, () => {
            myAudio.record(this.setOnplayPred);
        });
    }

    file(files) {
        this.setState({phase: 'onplay'}, () => {
            myAudio.file(files, this.setOnplayPred, this.setEnded);
        });
    }

    stop () {
        myAudio.close();
        this.setEnded();
    }



    setOnplayPred(pred) {
        this.setState({onplayPredId: pred});
    }

    setEnded() {
        const result = myDataset.getResult();  
        const resultId = result.classId;
        const confidence = result.confidence;  
        console.log(result);  
        this.setState({resultId, confidence, onplayPredId: -1, phase: 'ended'});
    }
}