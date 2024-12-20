import { PadMode } from "./PadMode";
import { singleton } from "tsyringe";
import { Mode } from "./Mode";
@singleton()
export class ModeController {

    modes: Mode[];

    constructor() {
        this.modes = [];
    }

    loadDefault() {
        if(!this.modes || this.modes.length === 0) {
            this.modes = [new PadMode()]
        }

        this.modes[0].setup();
    }
}
