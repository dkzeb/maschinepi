import soundEngine from './classes/webaudioSE';
import { PrismaClient } from '@prisma/client';

(async () => {    
    const p = new PrismaClient();

    const testSample = await p.sample.findFirst({
        where: {
            name: 'hat 01.wav'
        }
    });   
    
    await soundEngine.addSource(testSample.name, testSample.data);
    
    setInterval(() => {
        soundEngine.play(testSample.name);    
    }, 250);
})();