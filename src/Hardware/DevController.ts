import { EventBus } from "../Core/EventBus";
import { container, singleton } from "tsyringe";
import * as readline from 'readline';

readline.emitKeypressEvents(process.stdin);

const deviceMap: Record<string, string> =
    {
        '!': 'd1',
        '"': 'd2',
        '#': 'd3',
        '¤': 'd4'
    }
;

@singleton()
export class DevController {
    ebus: EventBus = container.resolve(EventBus);

    constructor() {
        if(process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }   

        process.stdin.on('keypress', (chunk, key) => {

            if(key.name === 'c' && key.ctrl) {
                this.ebus.processEvent({
                    type: 'ApplicationEvent',
                    data: {
                        command: 'QUIT'
                    }
                })
            }

            console.log('DEV DEVICE KEYPRESS', chunk, key);
            if(deviceMap[key.sequence]) {
                this.fakeDeviceInput(deviceMap[key.sequence]);
            }            
        });
    }

    fakeDeviceInput(key: string) {
        console.log('emitting', key);
        this.ebus.processEvent({
            type: 'ButtonInput',
            name: key + ':pressed'
        });
        const timeoutHandler = setTimeout(() => {
            this.ebus.processEvent({
                type: 'ButtonInput',
                name: key + ':released'
            });
        }, 1000);
    }
}