import * as Speaker from 'speaker'

import { PrismaClient } from '@prisma/client';

const spk = new Speaker({
    channels: 2,
    sampleRate: 44100,
    bitDepth: 16
});
(async () => {    
    const p = new PrismaClient();

    const testSample = await p.sample.findFirst({
        where: {
            name: 'hat 01.wav'
        }
    });

    const chunkSize = (spk as any).samplesPerFrame;
    const chunkCount = Math.ceil(testSample.data.length / chunkSize);
    console.log('made', chunkCount, 'chunks of size', chunkSize);
    const chunks = [];
    // first chunk gets played 
    for(let i = 0; i < chunkCount; i++) {
        chunks[i] = testSample.data.subarray(i * chunkSize, i * chunkSize + chunkSize);
    }
    spk.on('drain', () => {
        // get the next chunk
        const nextChunk = chunks.shift();
        console.log('chunk length', chunks.length, nextChunk);
        if(nextChunk) {
            spk.write(nextChunk);
        }
    });
    spk.write(chunks.shift());

    setTimeout(() => {

    }, 1000);
})();