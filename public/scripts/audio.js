//import { ModelLoggingVerbosity } from "@tensorflow/tfjs-layers/dist/engine/training";
import * as model from './model.js';

export default class audio {
    constructor(type) {
        window.AudioContext = window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
        this.analyser = null;
        this.processor = null;
        this.FREQ_NUM =  128;
        this.PROCESS_NUM = 1024;
        this.PRED_BATCH_SIZE = 1;
        this.TRAIN_BATCH_SIZE = 10;

        this._MAX_BATCH_SIZE 
            = Math.max( this.PRED_BATCH_SIZE , this.TRAIN_BATCH_SIZE);
        this._MODE = type;


        this._context = new AudioContext();
        this._samplesCnt = 0;


        //this._predArray = new Uint8Array(this.PRED_BATCH_SIZE * this.FREQ_NUM * this.FREQ_NUM);

        this._canvas = document.getElementById("visualizer");
        this._ctx = this._canvas.getContext("2d");

        this._canvasTmp = document.createElement("canvas");
        this._canvasTmp.width=300;
        this._canvasTmp.height=200;
        this._ctxTmp = this._canvasTmp.getContext("2d");

        if(type === 'record') {
            this._dataArray  
                = new Uint8Array(this.PRED_BATCH_SIZE * this.FREQ_NUM * this.FREQ_NUM);
            
            if (navigator.mediaDevices.getUserMedia) {
                console.log('getUserMedia supported.');
                const constraints = {audio: true}
                let stream;
                navigator.mediaDevices.getUserMedia (constraints)
                   .then(
                        (stream) => {
                        this._source = this._context.createMediaStreamSource(stream);
                        this._setProcessor();
                   })
                   .catch( function(err) { console.log('The following gUM error occured: ' + err);})
             } else {
                console.log('getUserMedia not supported on your browser!');
             }
        }
        else if (type === 'file') {
            this._dataArray  
                = new Uint8Array(this.TRAIN_BATCH_SIZE * this.FREQ_NUM * this.FREQ_NUM);

            this._source = this._context.createBufferSource(); 
            var request = new XMLHttpRequest();
            request.open('GET', '/musics/TakeFive.mp3', true);
            request.responseType = 'arraybuffer'; 
            request.onload = () => {
                this._context.decodeAudioData(request.response, (buffer) => {
                    this._source.buffer = buffer;
                }, null);
            }
            request.send();
      
            this._source.connect(this._context.destination);
            this._setProcessor();
            this._source.start(0);
            
        } else {
            console.log("type not valid");
        }

    }

    _setProcessor() {
        this.analyser = this._context.createAnalyser();
        this.analyser.fftSize = this.FREQ_NUM * 2;

        this.processor = this._context.createScriptProcessor(this.PROCESS_NUM, 1, 1);
        this.processor.connect(this._context.destination);
        this.processor.onaudioprocess = () => {
            let dx = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dx);

            this._draw(dx); 

            this._samplesCnt++;
            const PICS_CNT = this._samplesCnt / 128;

            if(this._MODE === 'record') {
                if(PICS_CNT == this.PRED_BATCH_SIZE) {
                    this._samplesCnt = 0;
                    this.predict();
                }
            }
            else if(this._MODE === 'file'){
                if(PICS_CNT == this.TRAIN_BATCH_SIZE) {
                    this._samplesCnt = 0;
                    this.train();
                }
            }


        }

        this._source.connect(this.analyser);
        this.analyser.connect(this.processor);
    }


    _draw(dx) {
        this._ctxTmp.drawImage(this._canvas, 0, 0, 300, 200,  0, 0, 300, 200);

        this._ctx.setTransform(1, 0, 0, 1, -1, 0);
        this._ctx.drawImage(this._canvasTmp, 0, 0, 300, 200, 0, 0, 300, 200);
    
        for (let i = 0; i < this.FREQ_NUM; i++) {
            var value = dx[i];
            this._dataArray[this._samplesCnt * this.FREQ_NUM + i] = value;
    
            this._ctx.fillStyle = `rgb( ${value}, ${value}, ${value})`;
            this._ctx.fillRect(300 - 1, 200 - i, 1, 1);
        }

    }

    stop() {
        this._context.close();
    }

    async predict() {
        console.log(this._dataArray);
        model.predict(this._dataArray, this.PRED_BATCH_SIZE);
    }

    train() {
        console.log(this._dataArray);
        //model.train(this._dataArray);
    }

}