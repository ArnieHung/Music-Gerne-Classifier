import * as tf from '@tensorflow/tfjs';

const LEARNING_RATE = 0.001;

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

const optimizer = tf.train.rmsprop(LEARNING_RATE);

model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
});