import * as tf from '@tensorflow/tfjs';

import audio from "./audio.js";
import {dataset, loadSongs, songsArr} from "./data.js";
import {loadMobileNet, train} from "./model.js";


window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

loadMobileNet();
loadSongs();

let myAudio = null;
const myDataset = new dataset();

const RecordBtn = document.getElementById("Record");
const AddExampleBtn = document.getElementById("AddExample");
const TrainBtn  = document.getElementById("Train");
const StopBtn   = document.getElementById("Stop");


RecordBtn.onclick = () => {
    if(myAudio === null) {
        myAudio = new audio(myDataset, 'stream');
    }
}

AddExampleBtn.onclick = () => {
    if(myAudio === null){
        myAudio = new audio(myDataset, 'buffer');
    }
}


TrainBtn.onclick = () => {
    train(myDataset);
}

StopBtn.onclick = () => {
    if(myAudio !== null) {
        myAudio.close();
        myAudio = null;
    }
}



// console.log("backend: ", tf.getBackend());


