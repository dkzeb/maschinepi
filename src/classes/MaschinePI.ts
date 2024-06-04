import { ModeController } from "./Modes/ModeController";
import { EventBus } from "./EventBus";
import { Mixer } from "./Mixer";
import { SoundEngine } from "./SoundEngine";

import { container } from "tsyringe";

export class MaschinePI {

    modeController = container.resolve(ModeController);
    ebus = container.resolve(EventBus);        

    constructor() {
        console.log('MaschinePI');        
        this.modeController.loadDefault();        
    }

    listen() {
        setInterval(() => {});
    }
}