import * as tf from '@tensorflow/tfjs';

import {
    GENRES, GENRES_NUM, MUSIC_NUM_PER_GENRE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE, 
} from './config.js';


import * as myAudio from './audio.js'

import {getActivation} from './model.js'



class dataset {

  constructor() {
    this.numClasses = GENRES_NUM;
  
    // training data (tensor) 
    this.xs = null;
    this.ys =null;

    // songs data from backend
    this.songsArr = [];

    // user's uploading songs
    this.filesArr = [];

    //
    this.history = null;
  }


  async loadSongs() {
    for (let genre = 0; genre < GENRES_NUM; genre++) {
        for (let idx = 0; idx < MUSIC_NUM_PER_GENRE; idx++) {
  
            const GENRE = GENRES[genre];
            console.log(GENRE);
            const IDX = ('0000' + idx).slice(-5);
            const URL = `http://localhost:3000/musics/${GENRE}/${GENRE}.${IDX}.wav`
    
            fetch(URL)
            .then((res) => res.arrayBuffer())
            .then((buffer) => {    
                console.log(genre);
                const song = {genre, buffer}
                this.songsArr.push(song);
            })
        
        }
    }
    
  }

  loadFiles(files) {
    
    console.log("inputs changed");
    console.log(files);
    const file = files[0];
    console.log(file);

    return new Promise ((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
          const buffer = e.target.result;
          this.filesArr.push({buffer});
          resolve();
      }
    });
  }
  

  addExample(dataArray, label) {

    console.log(dataArray, label);

    const x = tf.tidy(() => getActivation(dataArray));
    const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses));

    if (this.xs == null) {
      this.xs = tf.keep(x);
      this.ys = tf.keep(y);
    } 
    else {
      const oldX = this.xs;
      this.xs = tf.keep(oldX.concat(x, 0));

      const oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));


      oldX.dispose();
      oldY.dispose();

      x.dispose();
      y.dispose();
    }

    console.log(this.xs);
    console.log(this.ys);
  }

  addHistory(pred) {
    if (this.history === null) {
      this.history = tf.keep(pred);
    }
    else {
      const oldHistory = this.history;
      this.history = tf.keep(tf.add(oldHistory, pred));
      oldHistory.dispose();
    }
  }

  getResult() {
    const predictedClass = this.history.as1D().argMax();
    const classId = (predictedClass.dataSync())[0];
    predictedClass.dispose();

    const confidence = tf.tidy(() => {
      const sum = this.history.sum();
      const max = this.history.max();
      return (tf.div(max, sum).dataSync())[0];
    });
    
    this.history.dispose();
    this.history = null;

    return {confidence, classId};
  }
}

export let myDataset = new dataset();