import * as model from './model.js';

import {
    GERNES, GERNES_NUM, MUSIC_NUM_PER_GERNE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE,
} from './config.js';



export default class audio {
    constructor(mode) {
        
        

        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        this.analyser = null;
        this.processor = null;
        this._exampleCnt = 0;

        this._MAX_BATCH_SIZE = Math.max(PRED_BATCH_SIZE, TRAIN_BATCH_SIZE);

        this._context = new AudioContext();

        this._canvas = document.getElementById("visualizer");
        this._ctx = this._canvas.getContext("2d");

        this._canvasTmp = document.createElement("canvas");
        this._canvasTmp.width = 300;
        this._canvasTmp.height = 200;
        this._ctxTmp = this._canvasTmp.getContext("2d");

        this.flag = 1;

        if (mode === 'record') {
            this._dataArray
                = new Uint8Array(PRED_BATCH_SIZE * FREQ_NUM * FREQ_NUM);
            this._labelsArray
                = new Uint8Array(PRED_BATCH_SIZE);

            if (navigator.mediaDevices.getUserMedia) {
                console.log('getUserMedia supported.');
                const constraints = { audio: true }
                let stream;
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(
                        (stream) => {
                            this._source = this._context.createMediaStreamSource(stream);
                            this._setProcessor(mode);
                        })
                    .catch(function (err) { console.log('The following gUM error occured: ' + err); })
            } else {
                console.log('getUserMedia not supported on your browser!');
            }
        }
        else if (mode === 'train') {
            this._dataArray
                = new Uint8Array(TRAIN_BATCH_SIZE * FREQ_NUM * FREQ_NUM);
            this._labelsArray
                = new Uint8Array(TRAIN_BATCH_SIZE);

            this._source = this._context.createBufferSource();

            for (let gerne_iter = 0; gerne_iter < 1; gerne_iter++) {
                for (let music_iter = 0; music_iter < MUSIC_NUM_PER_GERNE; music_iter++) {

                    var request = new XMLHttpRequest();
                   
                    console.log(`http://localhost:3000/musics/${GERNES[gerne_iter]}/${GERNES[gerne_iter]}_${music_iter}.mp3`);
                    request.open('GET', `http://localhost:3000/musics/${GERNES[gerne_iter]}_${music_iter}.mp3`, true);
                    request.responseType = 'arraybuffer';
                
                    request.onload = () => {
                        this._context.decodeAudioData(request.response, (buffer) => {
                            this._source.buffer = buffer;
                        }, null);
                    }
                    request.send();

                    this._source.connect(this._context.destination);
                    this._setProcessor(mode, gerne_iter);
                    this._source.start(0);
                }
            }

        } else {
            console.log("mode not valid");
        }

    }

    _setProcessor(mode, gerne) {
        
        this.analyser = this._context.createAnalyser();
        this.analyser.fftSize = FREQ_NUM * 2;

        this.processor = this._context.createScriptProcessor(PROCESS_NUM, 1, 1);
        this.processor.connect(this._context.destination);
        this.processor.onaudioprocess =  () => {
            console.log("recording...");
            let dx = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dx);

            this._draw(dx);

            this._labelsArray[this._exampleCnt] = gerne;

            this._exampleCnt++;
            const picsCnt = this._exampleCnt / 128;

            if (mode === 'record') {
                if (picsCnt == PRED_BATCH_SIZE) {
                    this._exampleCnt = 0;
                    //this.predict();
                    console.log("in processor");
                    model.predict(this._dataArray);
                    
                    console.log("out preocessor");
                }
            }
            else if (mode === 'train') {
                if (picsCnt == TRAIN_BATCH_SIZE) {
                    this._exampleCnt = 0;
                    if(this.flag) {
                        model.train(this._dataArray, this._labelsArray);
                        this.flag = 0;
                    }
                }
            }

            //await tf.nextFrame();
        }

        this._source.connect(this.analyser);
        this.analyser.connect(this.processor);
    }


    _draw(dx) {
        this._ctxTmp.drawImage(this._canvas, 0, 0, 300, 200, 0, 0, 300, 200);

        this._ctx.setTransform(1, 0, 0, 1, -1, 0);
        this._ctx.drawImage(this._canvasTmp, 0, 0, 300, 200, 0, 0, 300, 200);

        for (let i = 0; i < FREQ_NUM; i++) {
            var value = dx[i];
            this._dataArray[this._exampleCnt * FREQ_NUM + i] = value;

            this._ctx.fillStyle = `rgb( ${value}, ${value}, ${value})`;
            this._ctx.fillRect(300 - 1, 200 - i, 1, 1);
        }

    }

    stop() {
        this._context.close();
    }
}