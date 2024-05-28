import * as readline from "readline";

import { EventBus } from "./EventBus";
import { quitApplication } from "../app";
import { MaschineMk3 } from "ni-controllers-lib";

export class InputController {

    ebus: EventBus;
    mk3?: MaschineMk3;
    constructor(ebus: EventBus, mk3?: MaschineMk3) {
        this.ebus = ebus;
        if(mk3) {
            this.mk3 = mk3;                            
            Object.keys(this.mk3.buttons).forEach(key => {                
                this.mk3?.on(key +':pressed', (ev?: any) => {
                    if(ev) {
                        this.ebus.processEvent({
                            type: 'PadInput',
                            name: key+':pressed',
                            data: {
                                pressure: ev
                            }
                        });
                    } else {
                        this.ebus.processEvent({
                            type: 'ButtonInput',
                            name: key+':pressed',                            
                        });
                    }
                });
                this.mk3?.on(key +':released', (ev?: any) => {
                    if(ev) {
                        this.ebus.processEvent({
                            type: 'PadInput',
                            name: key+':released',
                            data: {
                                pressure: ev
                            }
                        });
                    } else {
                        this.ebus.processEvent({
                            type: 'ButtonInput',
                            name: key+':released',                            
                        });
                    }
                });
            });
            Object.keys(this.mk3.knobs).forEach(key => {
                this.mk3?.on(key+':changed', (v) => {
                    this.ebus.processEvent({
                        type: 'KnobInput',
                        name: key,
                        data: {...v}
                    })
                });
            });
            this.mk3.on('stepper:step', (dir) => {
                this.ebus.processEvent({
                    type: 'KnobInput',
                    name: 'navStep',
                    data: {
                        ...dir
                    }
                })
            });
        } else {
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
}