import * as tf from '@tensorflow/tfjs';

import audio from "./audio.js";
import {loadmodel} from "./model.js";


//tf.setBackend("webgl");

const recordBtn = document.getElementById("Record");
const trainBtn = document.getElementById("Train");
const stopBtn = document.getElementById("Stop");

let Audio;

recordBtn.onclick = () => {
    Audio = new audio('record');
}

trainBtn.onclick = () => {
    Audio = new audio('train');
}

stopBtn.onclick = () => {
    Audio.stop();
}

loadmodel();

console.log("backend: ", tf.getBackend());


