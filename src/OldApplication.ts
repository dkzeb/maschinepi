import 'reflect-metadata';
import 'dotenv/config';

// src/index.ts
import audioEngine from './AudioEngine/audioEngine';
import { container } from 'tsyringe';
import { DAW } from './Core/DAW';
import { UIController } from './UI/UIController';
import { MK3Controller } from './Hardware/MK3Controller';
import { StateController } from './Core/StateController';
import { DevController } from './Hardware/DevController';
import { EventBus } from './Core/EventBus';
import { filter } from 'rxjs';
import { DecentSampler } from './Plugins/DecentSampler';

class Application {

    static ebus: EventBus = container.resolve(EventBus);

    /**
     * * Core Application Loop (most outer layer) * * * * * * * * * * * * * * * * * * *
     * 
     * End goal is to obtain the init rest state of the application, eg:
     *  x - Environment is setup
     *  x - Hardware support has been determined (is MK3 connected)
     *  x - Audio Engine is ready and available
     *  x - UI Controller is ready and available
     *       x - - If DevMode, DevDisplays are ready and available
     *  - Hardware connection state (has it been connected and is it available)
     *  x - DAW component is ready and available
     * 
     */
    static async main(): Promise<void> {


        // set state for init env.
        //StateController.currentState.isDevMode = (process.env.MPI_DEVMODE === 'true') ?? false;
        //StateController.currentState.dataDirectory = process.env.MPI_DATA_DIR ?? '';

        // Clear out the system console (for logging purposes)
        console.clear();
        console.info("Starting MaschinePI ....");
    
        try {
            const mk3 = container.resolve(MK3Controller);                                    
            await mk3.init();            
            StateController.mk3 = mk3;
            StateController.currentState.hardwareConnected = true;            
        } catch (e) {            
            StateController.currentState.hardwareConnected = false;
        }

        await audioEngine.initAudioEngine();
        const UI = container.resolve(UIController);
        if(StateController.currentState.isDevMode) {            
            UI.createDevDisplays();             
            const devCtrl = container.resolve(DevController);        
            console.info('Dev Info:');
            const filteredEnvs = {};
            Object.entries(process.env).forEach((value) => {
                if(value[0].indexOf('MPI_') === 0) {
                    filteredEnvs[value[0]] = value[1];
                }
            })
            console.dir(filteredEnvs);
        }

        this.ebus.events.pipe(filter(e => e.type === 'ApplicationEvent')).subscribe((ev) => {
            if(ev.data.command === 'QUIT') {
                console.info("MASCHINE PI IS QUITING... PLEASE TURN OFF THE MASCHINE TO EXIT");
                process.exit(0);                
            }
        })
        
        const daw = await container.resolve(DAW);
        await daw.init();


        // launch the decent sampelr
        const smpler = new DecentSampler();

    }
}


// Asynchronous Main Loop for the application
(async () => {
    await Application.main();
})();
