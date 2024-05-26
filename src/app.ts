import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import { AudioController } from "./classes/AudioController";
import { DisplayController } from "./classes/DisplayController";
import { EventBus } from "./classes/EventBus";
import { InputController } from "./classes/InputController";
import { SoundEngine } from "./classes/SoundEngine";
import { StorageController } from "./classes/StorageController";
import { MK3GraphicsController } from "./classes/MK3Controller";
import { ModeController } from "./classes/Modes/ModeController";

export const ebus = new EventBus();

export const quitApplication = () => {
    process.exit(0);
    global.displayController?.deInit();
}
// Main Application Loop
(async () => {
    // setup Bus monitoring
    ebus.events.subscribe((ev) => {
        console.log('Event:', ev);

        if(ev.name === 'StorageController' && ev.type === 'Init') {
            console.log('RDY');
        }
    });    
    let maschine: MaschineMk3 | undefined;
    try {
        maschine = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);
        await maschine.init();
        console.log('MaschineMK3 Connected');
    } catch(e) {
        console.error('controller init', e);
        maschine = undefined;

    }

    const inputController = new InputController(ebus, maschine);
    const displayController = new DisplayController(ebus, maschine);    
    const soundEngine = new SoundEngine();
    const audioController = new AudioController(ebus, soundEngine);
    const storageController = new StorageController(ebus, soundEngine);
    const modeController = new ModeController(ebus, maschine, displayController);

    // to avoid GC add controllers to the global scope
    global.inputController = inputController;
    global.displayController = displayController;
    global.modeController = modeController;
    global.audioController = audioController;
    global.storageController = storageController;

    ebus.processEvent({
        type: 'UpdateDisplay'
    });

    // set initial mode to padMode
    // stupid loop
    /*setInterval(() => {
    }, 1);*/
    
})();