import { parentPort, workerData } from 'node:worker_threads';
import * as fs from 'fs';
import * as jpeg from 'jpeg-js';

(async() => {    

    parentPort?.on('message', (path: string) => {
        console.log('Converting', path);
        
        const img = fs.readFileSync(path);
        const imgData = jpeg.decode(img, {
            useTArray: true,
            formatAsRGBA: false
        });

        const arrayBuf = (() => {
            if (imgData.data.byteOffset === 0 && imgData.data.byteLength === imgData.data.buffer.byteLength) {
                // no extra bytes, return the ArrayBuffer
                return imgData.data.buffer;
            }else {
                // copy the relevant part to a new ArrayBuffer
                return imgData.data.buffer.slice(imgData.data.byteOffset, imgData.data.byteOffset + imgData.data.byteLength);
            }
        })();

        parentPort?.postMessage(arrayBuf, [arrayBuf]);
    });

    console.log('Worker Data', workerData);
})();