import 'reflect-metadata';
import { EventBus } from "./classes/EventBus";
import { MaschinePI } from './classes/MaschinePI';
import { container } from 'tsyringe';
import { MK3Controller } from './classes/MK3Controller';

export const ebus = container.resolve(EventBus);
export const quitApplication = () => {
    process.exit(0);    
}

// Main Application Loop
(async () => {                

    // init the mk3
    const mk3 = container.resolve(MK3Controller);
    await mk3.init();
    mk3.allLEDsOff();
    const app = new MaschinePI();  
    global.maschinePi = app;  
})();