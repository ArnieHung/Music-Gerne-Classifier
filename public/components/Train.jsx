import React, { Component } from 'react';
import LineChart from 'react-linechart';

import * as myModel from '../scripts/model';
import {myDataset} from '../scripts/data';
import * as myAudio from '../scripts/audio';

export default class Train extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
            phase: "pending",
            lines:
            [
                {
                    name:'training',
                    color: '#76B4FF',
                    points: []
                },
                {
                    name:'validation',
                    color: ' #FFC175',
                    points: []
                }
            ]
        };

        this.train = this.train.bind(this);
        this.addExample = this.addExample.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);

        this.setEnded = this.setEnded.bind(this);
        this.setLines = this.setLines.bind(this);
        this.setPaused = this.setPaused.bind(this);

       
      }

    render() {
        let exampleBtnOnclick = null;
        let sticker = null;
        let buttom = null;

        if(this.state.phase === 'addingExample') {
            exampleBtnOnclick = this.pause;
            buttom = 'Pause';
            sticker =  (
                <div class='row justify-content-center'>
                    <div class='col-6'>
                        <canvas id="visualizer" width="300" height="150"></canvas>
                    </div>
                </div>
            );
        }

        else if(this.state.phase === 'paused') {
            exampleBtnOnclick = this.addExample;
            buttom = 'Resume';

            sticker =  (
                <div class='row justify-content-center'>
                    <div class='col-6'>
                        <canvas id="visualizer" width="300" height="150"></canvas>
                    </div>
                </div>
            );
        }

        else if(this.state.phase === 'ended') {
            buttom = 'Add Example';
            exampleBtnOnclick = this.addExample;
            sticker = <h4 align="center">Examples been added!</h4>
        }
        else if(this.state.phase === 'training') {
            buttom = 'Add Example';
            exampleBtnOnclick = this.addExample;
            sticker = (
                <div class='row justify-content-center'>
         
                <LineChart 
                    width={500}
                    height={300}
                    data={this.state.lines}
                    pointRadius={2}
                    xLabel={'epochs'}
                    yLabel={'loss'}
                    showLegends={true}
                    legendPosition={'top-right'}

                />
                       
                </div>
            );
        }

        else if(this.state.phase === 'pending') {
            buttom = 'Add Example';
            exampleBtnOnclick = this.addExample;
        }



        return (
            <div>
                {
                    sticker
                }

                <div class='row'>
                    <button class='col btn btn-outline-white' id="AddExample" onClick={exampleBtnOnclick}>{buttom}</button>
                    <button class='col btn btn-outline-white' id="Train" onClick={this.train}>Train</button>
                    <button class='col btn btn-outline-white' id="Stop" onClick={this.stop}>Stop</button>
                </div>
            </div>
        );
    }

    addExample () {
        if(this.state.phase === 'paused') {
            this.setState({phase: 'addingExample'}, () => {
                myAudio.resume();
            })    
        } 
        else {
            this.setState({phase: 'addingExample'}, () => {
                myAudio.addExample(this.setEnded);
            })
        }

    }

    pause () {
            console.log('hihi');
            myAudio.pause(this.setPaused);
        
    }

    stop () {
        myAudio.close();
        this.setEnded();
    }

    train () {
        this.setState({phase: 'training'}, () => {
           myModel.train(myDataset, this.setLines);
        });
    }

    setLines (loss, val_loss, epoch) {

        this.setState((prevState, props) => {
            const newLineZeroPoints = prevState.lines[0].points.push({x: epoch, y: loss});
            const newLineOnePoints = prevState.lines[1].points.push({x: epoch, y: val_loss});
            console.log(newLineZeroPoints, newLineOnePoints);
            return prevState;
        });
    }
    
    setPaused() {
        this.setState({phase: 'paused'});
    }

    setEnded() {
        this.setState({phase: 'ended'});
    }
} 