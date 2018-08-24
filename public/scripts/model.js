import * as tf from '@tensorflow/tfjs';
import {
    GENRES, GENRES_NUM, MUSIC_NUM_PER_GENRE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE,
} from './config.js';


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
        units: 256,
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

const optimizer = tf.train.sgd(0.1);
model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});



export async function loadMobileNet() {
    truncModel =  await tf.loadFrozenModel(MODEL_URL, WEIGHTS_URL);
    //warm up ??
} 



export function getActivation (dataArray) { // will activation be dispose??

    const activation = tf.tidy(() => {
        const data = tf.tensor3d(dataArray, [1, 128, 128]); // arr --> tensor
        const rgbData = tf.stack([data, data, data], 3);    // --> 3 rgb channel
        const activation =  truncModel.predict(rgbData);
        return activation;
    });

    return activation;
}



export async function predict(dataArray) {

    const predictedClass = tf.tidy(() => {
        const activation =  getActivation(dataArray);
        const predictions = model.predict(activation);
        return predictions.as1D().argMax();
      });
  
      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
      console.log(classId);

      await tf.nextFrame();
    
} 



export async function train(dataset) {
 
    model.fit(dataset.xs, dataset.ys, {
            batchSize: 2, 
            epochs: 3,
            callbacks: {
                onBatchEnd: async (batch, logs) => {
                  console.log('Loss: ' + logs.loss.toFixed(5));
                  await tf.nextFrame();
                }
            }
        }
    );

}