import * as readline from "readline";

import { EventBus } from "./EventBus";
import { quitApplication } from "../app";

export class InputController {

    ebus: EventBus;
    constructor(ebus: EventBus) {
        this.ebus = ebus;

        readline.emitKeypressEvents(process.stdin);
        process.stdin.on('keypress', (chunk, key) => {
            if(key.name === 'c' && key.ctrl === true) {                
                quitApplication();
            }

            switch(chunk) {
                case "t": 
                this.ebus.processEvent({
                    type: 'PadInput',
                    data: {
                        sampleName: 'snare 04.wav'
                    }
                });
                break;
                case "e": 
                this.ebus.processEvent({
                    type: 'PadInput',
                    data: {
                        sampleName: 'hat 04.wav'
                    }
                });
                break;
                case "q": 
                this.ebus.processEvent({
                    type: 'PadInput',
                    data: {
                        sampleName: 'kick 04.wav'
                    }
                });
                break;
            }
        });

        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);

        this.ebus.processEvent({
            name: 'InputController',
            type: 'Init'
        });
    }
}