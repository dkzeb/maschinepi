import { AudioController } from "./classes/AudioController";
import { DisplayController } from "./classes/DisplayController";
import { EventBus } from "./classes/EventBus";
import { InputController } from "./classes/InputController";
import { LEDController } from "./classes/LEDController";
import { SoundEngine } from "./classes/SoundEngine";
import { StorageController } from "./classes/StorageController";

export const ebus = new EventBus();

export const quitApplication = () => {
    global.displayController.deInit();
    process.exit(0);
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

    const inputController = new InputController(ebus);
    const displayController = new DisplayController(ebus);
    const ledController = new LEDController(ebus);
    const soundEngine = new SoundEngine();
    const audioController = new AudioController(ebus, soundEngine);
    const storageController = new StorageController(ebus, soundEngine);

    // to avoid GC add controllers to the global scope
    global.inputController = inputController;
    global.displayController = displayController;
    global.ledController = ledController;
    global.audioController = audioController;
    global.storageController = storageController;

    ebus.processEvent({
        type: 'UpdateDisplay'
    });

    // stupid loop
    setInterval(() => {
    }, 1);
    
})();