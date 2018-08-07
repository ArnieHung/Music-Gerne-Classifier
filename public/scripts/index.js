import audio from "./audio.js";


const recordBtn = document.getElementById("Record");
const trainBtn = document.getElementById("Train");
const stopBtn = document.getElementById("Stop");

let Audio;

recordBtn.onclick = () => {
    Audio = new audio('record');
}

trainBtn.onclick = () => {
    Audio = new audio('file');
}

stopBtn.onclick = () => {
    Audio.stop();
}


