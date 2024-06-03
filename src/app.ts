import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import { DisplayController } from "./classes/DisplayController";
import { EventBus } from "./classes/EventBus";
import { InputController } from "./classes/InputController";
import { SoundEngine } from "./classes/SoundEngine";
import { StorageController } from "./classes/StorageController";
import { MK3GraphicsController } from "./classes/MK3Controller";
import { ModeController } from "./classes/Modes/ModeController";
import { UIController } from "./classes/UI/UIController";
import { Mixer } from "./classes/Mixer";

export const ebus = new EventBus();

export const quitApplication = () => {
    process.exit(0);
    global.displayController?.deInit();
}
// Main Application Loop
(async () => {    
    let maschine: MaschineMk3 | undefined;
    try {
        maschine = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);
        await maschine.init();
        console.log('MaschineMK3 Connected');
    } catch(e) {
        console.error('controller init', e);
        maschine = undefined;

    }

    const soundEngine = new SoundEngine();    
    if(maschine) {
        const gfxController = new MK3GraphicsController(maschine);
        const uiCtrl = new UIController(ebus, gfxController, soundEngine);
        global.uiController = uiCtrl;
    }

    const inputController = new InputController(ebus, maschine);
    const displayController = new DisplayController(ebus, maschine);    
    const storageController = new StorageController(ebus, soundEngine);
    const mixer = new Mixer(soundEngine);
    const modeController = new ModeController(ebus, mixer, maschine, displayController);

    // to avoid GC add controllers to the global scope
    global.inputController = inputController;
    global.displayController = displayController;
    global.modeController = modeController;    
    global.storageController = storageController;    
    global.mixer = mixer;

    ebus.processEvent({
        type: 'UpdateDisplay'
    });

    // set initial mode to padMode
    // stupid loop
    /*setInterval(() => {
    }, 1);*/
    
})();