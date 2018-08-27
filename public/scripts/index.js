import * as tf from '@tensorflow/tfjs';

import audio from "./audio.js";         // load audio class
import dataset from "./data.js";        // load dataset class
import * as model from "./model.js";    // load loadMobilenet(), train()


const RecordBtn = document.getElementById("Record");
const AddExampleBtn = document.getElementById("AddExample");
const TrainBtn  = document.getElementById("Train");
const StopBtn   = document.getElementById("Stop");

const fileInputs = document.getElementById("fileInputs");


let myAudio = null;                     // only exist one audio obj, set to null when audio is not registered
const myDataset = new dataset();        // 

window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;


model.loadMobileNet();  // load the truncated mobilenet
myDataset.loadSongs();  // fetch songs from backend and add them to datast.songsArr[]




RecordBtn.onclick = () => {
    if(myAudio === null) {
        myAudio = new audio(myDataset, 'stream');
    }
}

AddExampleBtn.onclick = () => {
    if(myAudio === null){
        myAudio = new audio(myDataset, 'addExample');
    }
}


TrainBtn.onclick = () => {
    model.train(myDataset);
}

StopBtn.onclick = () => {
    if(myAudio !== null) {
        myAudio.close();
        myAudio = null;
    }
}

// on detecting user's uplaoding files,
// play and predict the uploaded file.
fileInputs.onchange = () => myDataset.loadFiles(fileInputs.files);


// console.log("backend: ", tf.getBackend());


