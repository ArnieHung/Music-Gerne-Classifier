
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const Record = document.getElementById("Record");
const Stop = document.getElementById("Stop");

Record.onclick = () => {
    audioCtx = new AudioContext();
    setupNodes();
}

Stop.onclick = () => {
    audioCtx.close();
}

let stream;

let source;
let analyser;
let processor;
let bufferLength;

const FREQ_NUM = 128;
const PROCESS_NUM = 1024;

const canvas = document.getElementById("visualizer");
let ctx = canvas.getContext("2d");

const canvasTmp = document.createElement("canvas");
canvasTmp.width=300;
canvasTmp.height=200;
let ctxTmp = canvasTmp.getContext("2d");



let samplesCnt = 0;
let dataArray =  new Uint8Array(FREQ_NUM * FREQ_NUM);


function predict (dataArray) {
    console.log(dataArray);
}

function draw(dx) {

    ctxTmp.drawImage(canvas, 0, 0, 300, 200,  0, 0, 300, 200);

    for (let i = 0; i < FREQ_NUM; i++) {
        var value = dx[i];
        dataArray[samplesCnt*FREQ_NUM + i] = value;

        ctx.fillStyle = `rgb( ${value}, ${value}, ${value})`;
        ctx.fillRect(300 - 1, 200 - i, 1, 1);
    }
    ctx.translate(-1, 0);
    ctx.drawImage( canvasTmp, 0, 0, 300, 200, 0, 0, 300, 200);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

}


function setupNodes() {
    if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
        const constraints = {audio: true}
        navigator.mediaDevices.getUserMedia (constraints)
           .then(
             function(stream) {
                source = audioCtx.createMediaStreamSource(stream);

                analyser = audioCtx.createAnalyser();
                analyser.fftSize = FREQ_NUM * 2;
                bufferLength = analyser.frequencyBinCount;

                processor = audioCtx.createScriptProcessor(PROCESS_NUM, 1, 1);
                processor.connect(audioCtx.destination);
                processor.onaudioprocess = () => {
                    let dx = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(dx);

                    draw(dx); 
                  
                    if((++samplesCnt) == 128 ) {
                        predict(dataArray);
                        samplesCnt = 0;
                    }      
                }

                source.connect(analyser);
                analyser.connect(processor);
           })
           .catch( function(err) { console.log('The following gUM error occured: ' + err);})
     } else {
        console.log('getUserMedia not supported on your browser!');
     }
}

// function connectNodes() {
    
    
// } 

 //connectNodes();