
import {
    GERNES, GERNES_NUM, MUSIC_NUM_PER_GERNE,
    FREQ_NUM, PROCESS_NUM,
    PRED_BATCH_SIZE, TRAIN_BATCH_SIZE,
} from './config.js';


const model = tf.sequential();

model.add(tf.layers.conv2d({
    inputShape: [128, 128, 1],
    kernelSize: 2,
    filters: 64,
    strides: 1,
    activation: 'elu',
    kernelInitializer: 'glorotNormal'
}));

model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));

model.add(tf.layers.conv2d({
    kernelSize: 2,
    filters: 128,
    strides: 1,
    activation: 'elu',
    kernelInitializer: 'glorotNormal'
}));

model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));


model.add(tf.layers.conv2d({
    kernelSize: 2,
    filters: 256,
    strides: 1,
    activation: 'elu',
    kernelInitializer: 'glorotNormal'
}));

model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));

model.add(tf.layers.conv2d({
    kernelSize: 2,
    filters: 512,
    strides: 1,
    activation: 'elu',
    kernelInitializer: 'glorotNormal'
}));

model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
    units: 1024,
    kernelInitializer: 'truncatedNormal',
    activation: 'elu'
}));

model.add(tf.layers.dense({
    units: 10,
    kernelInitializer: 'VarianceScaling',
    activation: 'softmax'
}));

const LEARNING_RATE = 0.001;

model.compile({
    optimizer: tf.train.rmsprop(LEARNING_RATE),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
});

export async function predict(dataArray) {
    tf.tidy(() => {
        const data = tf.tensor4d(dataArray, [PRED_BATCH_SIZE, 128, 128, 1]);
        model.predict(data);
        //result.print();
    });
    // const data = tf.tensor4d(dataArray, [PRED_BATCH_SIZE, 128, 128, 1]);
    // const predictPromise = async() => {
    //     return model.predict(data)
    // };
    // console.log("in predict");
    // const prediction = await predictPromise();
    // console.log("out predict");

    // data.dispose();
    // prediction.dispose();

    const predictedClass = tf.tidy(() => {
    
        const data = tf.tensor4d(dataArray, [PRED_BATCH_SIZE, 128, 128, 1]);
        const predictions = model.predict(activation);
        return predictions.as1D().argMax();
      });
  
      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
      conslog(classId);

    
} 

export async function train(dataArray, labelsArray) {

    const data = tf.tensor4d(dataArray, [TRAIN_BATCH_SIZE, 128, 128, 1]);;
    const labels = tf.oneHot(labelsArray, GERNES_NUM);
    //const labels = tf.oneHot(labelsArray);
    data.print();
    labels.print();

    const history = await model.fit(
        data, labels,
        {batchSize: TRAIN_BATCH_SIZE, epochs: 2}
    );
    console.log("examples trained!");
    const loss = history.history.loss[0];
    const accuracy = history.history.acc[0];

    console.log(`loss: ${loss}`, `accuracy: ${accuracy}`);

    data.dispose();
    labels.dispose();

    await tf.nextFrame();
}