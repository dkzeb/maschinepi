import { MaschineMk3 } from "ni-controllers-lib";
import { DisplayController } from "../DisplayController";
import { EventBus } from "../EventBus";
import { PadMode } from "./PadMode";

export type ModeType = 'PadMode' | 'LiveMode';
export interface Mode {
    type: ModeType;
    setup?: () => void;
}

export class ModeController {
        
    currentMode?: Mode;
    modes: Mode[] = [];
    mk3?: MaschineMk3;
    ebus: EventBus;
    display?: DisplayController;
    constructor(ebus: EventBus, controller?: MaschineMk3, displayController?: DisplayController) {
        this.ebus = ebus;
        if(displayController) {
            this.display = displayController;
        }
        if(controller) {
            this.mk3 = controller;            
            this.addMode(new PadMode(this.ebus, this.mk3));
        }        
    }

    addMode(m: Mode) {
        if(!this.modes) {
            this.modes = [m];
            this.setMode(this.modes[0].type);
        } else {
            this.modes.push(m);
        }

    }
    setMode(mode: ModeType) {
        const m = this.modes.find(m => m.type === mode);
        if(m?.setup) {            
            m.setup();
        } else {
            console.error("UNKNOWN MODE: " + mode);
        }
    }
    
}


