import { EventBus } from "../Core/EventBus";
import { PixiWidget } from "./PixiWidget";
import { container } from "tsyringe";

export class SamplerWidget extends PixiWidget {

    sampler: Sampler;

    constructor() {
        super({
            name: 'Sampler',
            titlebar: {
                title: 'Sampler',
                color: "0xFFFFFF"
            }
        });
        this.sampler = new Sampler();
    }
}

class Sampler {

    pads: Pad[] = [];

    constructor() {
        for(let i = 0; i < 16; i++) {
            this.pads.push(
                new Pad(i + 1, 'p' + padMap[i])
            );
        }
    }

}

class Pad {

    ebus: EventBus = container.resolve(EventBus);

    padId: string;
    padName: string;

    state = {
        color: "white",
        brightness: .5
    }

    constructor(padId: number, padName: string) {
        this.padId = 'p' + padId;
        this.padName = padName;

        console.log('Pad', this.padName, 'ID:', this.padId);

        this.ebus.filterEvent('PadInput', 'sampler' + this.padName, this.padId, (ev) => {
            console.log('Pad EV', this.padName);
        });
    }
}

const padMap = [13, 14, 15, 16, 9, 10, 11, 12, 5, 6, 7, 8, 1, 2, 3, 4];