import * as path from 'node:path';

import { Worker } from 'node:worker_threads';

const screenWorker = new Worker(path.join(process.cwd(), 'src', 'screenWorker.mjs'));
screenWorker.postMessage('INIT');

setInterval(() => {
    console.log('i am also doing stuff');
});