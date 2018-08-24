import * as tf from '@tensorflow/tfjs';

import {
    GENRES, GENRES_NUM, MUSIC_NUM_PER_GENRE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE, 
} from './config.js';

import {getActivation} from './model.js'

export let songsArr = [];


export async function loadSongs() {
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
              songsArr.push(song);
          })
      
      }
  }
  
}


export  class dataset {

  constructor() {
    this.numClasses = GENRES_NUM;
  }

  addExample(dataArray, label) {

    console.log(dataArray, label);

    const x = getActivation(dataArray);
    const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses));

    if (this.xs == null) {
      this.xs = tf.keep(x);
      this.ys = tf.keep(y);
    } else {
      const oldX = this.xs;
      this.xs = tf.keep(oldX.concat(x, 0));

      const oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));

      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
    console.log(this.xs);
    console.log(this.ys);
  }
}
