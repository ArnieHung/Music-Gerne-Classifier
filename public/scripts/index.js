//tf.setBackend("webgl");


import audio from "./audio.js";
import * as tf from '@tensorflow/tfjs';


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

console.log("backend: ", tf.getBackend());


