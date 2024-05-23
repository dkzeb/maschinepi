import { EventBus } from "./EventBus";

export class LEDController {

    ebus: EventBus;
    constructor(ebus: EventBus) {
        this.ebus = ebus;
    }
}