import 'reflect-metadata';
import 'dotenv/config';

// src/index.ts
import audioEngine from './AudioEngine/audioEngine';
import { container } from 'tsyringe';
import { DAW } from './Core/DAW';
import { UIController } from './UI/UIController';
import { MK3Controller } from './Hardware/MK3Controller';

(async () => {
    await audioEngine.initAudioEngine();
    const daw = await container.resolve(DAW);
    const UI = container.resolve(UIController);
    if(process.env.MPI_DEVMODE === "true") {
        UI.createDevDisplays();
    }

    try {
        const mk3 = await container.resolve(MK3Controller);
        await mk3.init();
    } catch (e) {
        console.log('Could not INIT MK3');
    }
    
    if(process.env.MPI_DEVMODE === "true") {
        console.clear();
        console.info('Dev Info:');
        const filteredEnvs = {};
        Object.entries(process.env).forEach((value) => {
            if(value[0].indexOf('MPI_') === 0) {
                filteredEnvs[value[0]] = value[1];
            }
        } )
        console.dir(filteredEnvs);
        
    }
        
    await daw.init();
})();
