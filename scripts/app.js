const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let stream;

let source;
let analyser;
let processor;
let bufferLength;

const FREQ_NUM = 128;
const PROCESS_NUM = 1204;




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

 setupNodes();
 //connectNodes();