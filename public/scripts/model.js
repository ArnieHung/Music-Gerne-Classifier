import * as tf from '@tensorflow/tfjs';
import {
    GENRES, GENRES_NUM, MUSIC_NUM_PER_GENRE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE,
} from './config.js';

import {myDataset} from './data'


const MODEL_URL = 'http://localhost:3000/truncated_model/tensorflowjs_model.pb'; 
const WEIGHTS_URL = 'http://localhost:3000/truncated_model/weights_manifest.json'; 

let model;
let truncModel;

model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [4, 4, 1024]}),
      // Layer 1
      tf.layers.dense({
        units: 256,           // 1024 is too large for tf.js 
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: GENRES_NUM,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
});

const optimizer = tf.train.rmsprop(0.00001); // 0.1 is too big, loss will oscillate in result 
model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});



export async function loadMobileNet() {
    truncModel =  await tf.loadFrozenModel(MODEL_URL, WEIGHTS_URL);
    //warm up ??
} 



export function getActivation (dataArray) { // will activation be dispose??

    const activation = tf.tidy(() => {
        const data = tf.tensor3d(dataArray, [1, 128, 128]); // arr --> tensor
        const rgbData = tf.stack([data, data, data], 3);    // --> 3 rgb channel [1, 128,]
        const activation =  truncModel.predict(rgbData);
        return activation;
    });

    return activation;
}



export async function predict(dataArray) {

    const predictedClass = tf.tidy(() => {
        const activation =  getActivation(dataArray);
        const predictions = model.predict(activation);
        myDataset.addHistory(predictions);
        return predictions.as1D().argMax();
      });
  
      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
      console.log(classId);
      return classId;
   
    
} 



export async function train(dataset, setLines) {
 
    model.fit(dataset.xs, dataset.ys, {
            validationSplit: 0.1, 
            batchSize: 5, 
            epochs: 10,
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    console.log(logs, epoch);
                    setLines(logs.loss, logs.val_loss, epoch);
                    await tf.nextFrame();
                },
                onBatchEnd: async (batch, logs) => {
                    console.log(logs);
                  console.log('Loss: ' + logs.loss.toFixed(5));
                  await tf.nextFrame();
                }
            }
        }
    );

}