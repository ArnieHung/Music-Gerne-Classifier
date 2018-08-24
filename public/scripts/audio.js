import * as model from './model.js';

import {
    GENRES, GENRES_NUM, MUSIC_NUM_PER_GENRE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE,
} from './config.js';

import {songsArr} from './data.js';



export default class audio {
    constructor(dataset, mode) {
        
        this.dataset = dataset;
        this.mode = mode;

        // data buffer array to store sound image, 
        // converted to tensor later.
        this._dataArray = new Uint8Array(FREQ_NUM * FREQ_NUM);
    
        // declare web audio nodes
        this._context = new AudioContext();
        this._streamSource = null;
        this._bufferSource = null;
        this._analyser = null;
        this._processor = null;

        this._exampleCnt = 0;

        // current genre
        this._genre = null;

        // canvas 
        this._canvas = document.getElementById("visualizer");
        this._ctx = this._canvas.getContext("2d");

        this._canvasTmp = document.createElement("canvas");
        this._canvasTmp.width = 300;
        this._canvasTmp.height = 200;
        this._ctxTmp = this._canvasTmp.getContext("2d");


        // build web audio graph

        this._createAnalyzer();

        this._createProcessor();

        this._createSource()
        .then(() => {this._connectNodes()})
        .catch((err) => {console.log(err);});

    }

    async _createSource() {
        if(this.mode === 'buffer') {
            this._createBufferSource();
        }
        else if (this.mode === 'stream') {
            return this._createStreamSource();
        }
    }



    async _createStreamSource() {
        if (navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            const constraints = { audio: true }
            return (
                navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    console.log('in');
                    this._streamSource = this._context.createMediaStreamSource(stream);
                
                })
                .catch(function (err) { console.log('The following gUM error occured: ' + err); })
            );
        } 
        else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    _createBufferSource() {
        this._bufferSource = this._context.createBufferSource();
        this._getNewSong();

        // when the song ended...
        this._bufferSource.onended = () => {
            console.log("song ended!!");  

            // if there's no more song in  songsArr
            if(songsArr.length == 0) {
                console.log('no songs to add!!');
                // terminate the audio
                this._context.close();
            }
            else {
                // disconnect the previous source
                this._bufferSource.disconnect();
                // create a new source 
                this._createBufferSource();
                // conect the new source to other audio nodes
                this._bufferSource.connect(this._analyser);
                this._bufferSource.connect(this._context.destination);
                
            }
        }
        //this._connectNodes();

    }

    _createAnalyzer() {
        this._analyser = this._context.createAnalyser();
        this._analyser.fftSize = FREQ_NUM * 2;
    }



    _createProcessor() {
        this._processor = this._context.createScriptProcessor(PROCESS_NUM, 1, 1);
        this._processor.onaudioprocess =  () => {
            console.log('in processor');
            let dx = new Uint8Array(this._analyser.frequencyBinCount);

            this._analyser.getByteFrequencyData(dx);

            this._draw(dx);

            this._exampleCnt++;
            const picsCnt = this._exampleCnt / 128; 

            if(picsCnt === 1) {
                if (this.mode === 'stream') {
                    this._exampleCnt = 0;
                    model.predict(this._dataArray);
                }
    
                else if (this.mode === 'buffer') {
                    this._exampleCnt = 0;
                    this.dataset.addExample(this._dataArray, this._genre);           
                }
            }

        }
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



    _connectNodes() {
        if(this.mode === 'buffer') {       
            this._bufferSource.connect(this._analyser);
            this._bufferSource.connect(this._context.destination); 
        }
        else if (this.mode === 'stream') {
            console.log(this._analyser);
            console.log(this._streamSource);
            this._streamSource.connect(this._analyser);
        }
        this._analyser.connect(this._processor);
        this._processor.connect(this._context.destination); // ??? 
    }


    _getNewSong() {
        const song =songsArr.pop();

        // set the on-play song gerne
        this._genre = song.genre;

        // decode and start playing the song
        this._context.decodeAudioData(song.buffer, (decodeData) => {
            this._bufferSource.buffer = decodeData;
            this._bufferSource.start(0);
        });
    }

    close() {
        this._context.close();
    }
}