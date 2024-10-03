import { ModeController } from "./Modes/ModeController";
import { EventBus } from "./EventBus";
import { Mixer } from "./Mixer";
import { SoundEngine } from "./SoundEngine";

import { container } from "tsyringe";
import { StorageController } from "./StorageController";

export class MaschinePI {

    modeController = container.resolve(ModeController);
    ebus = container.resolve(EventBus);
    soundEngine = container.resolve(SoundEngine);
    storage: StorageController;

    constructor() {
        console.log('MaschinePI');        
        this.storage = new StorageController();        
        this.modeController.loadDefault();        
    }

    listen() {
        setInterval(() => {});
    }
}