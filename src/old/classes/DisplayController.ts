import * as r from 'raylib';
import * as path from 'node:path';

import { EventBus, MPIEvent } from "./EventBus";

import { MaschineMk3 } from 'ni-controllers-lib';
import { filter } from 'rxjs';
import { Worker } from 'node:worker_threads';

type OutputDisplay = {
    name: string;
    width: number;
    height: number;
    init: () => void;
    deInit: () => void;
    update: (...args: unknown[]) => void;
    renderRoutine?: string | ((...args) => string);
}

type UpdateDisplayEventData = {
    target: string;
    payload: any;
}

interface UpdateDisplayEvent extends MPIEvent {
    data?: UpdateDisplayEventData;
}

export class DisplayController {

    displays: OutputDisplay[];
    ebus: EventBus;
    controller?: MaschineMk3;

    constructor(ebus: EventBus, controller?: MaschineMk3) {
        this.ebus = ebus;
        this.controller = controller;

        this.displays = [
            //new MainDisplay(),            
        ];
        if(this.controller) {
            this.displays.push(new MK3DevDisplay('MKLeft', MK3Displays.LEFT, this.controller));
            this.displays.push(new MK3DevDisplay('MKLeft', MK3Displays.RIGHT, this.controller));
        }

        this.displays.forEach(d => {
            d.init();
        });

        setInterval(() => {
            this.displays.forEach(d => {
                d.update();
            })
        }, 1000/60);

        this.ebus.events.pipe(filter(t => t.type === 'UpdateDisplay')).subscribe((ev: UpdateDisplayEvent) => {
            if(ev.data) {
                this.displays.find(d => d.name === ev.data?.target)?.update(ev.data.payload);
            } else {
                this.displays.forEach(d => d.update());
            }
        });
    }
    
    deInit() {
        this.displays.forEach(d => {
            d.deInit();
        })
    }
}

class MainDisplay implements OutputDisplay {
    name: string = 'MainDisplay';
    width: number = 800;
    height: number = 480;    
    displayWorker: Worker = new Worker(path.join(__dirname, `renderWorker.${__filename.split('.')[1]}`), {        
        name: 'mainDisplayWorker',                    
    });
    
    renderRoutine = (f: () => void) => {
        return f.toString();
    }    

    init() {                
        const initMethod = () => {
            console.log('init main display');
            r.SetTargetFPS(60);
            r.InitWindow(800, 480, 'MaschinePI');            
        };        
        this.displayWorker.postMessage(initMethod.toString());
    }

    deInit() {                
        r.CloseWindow();
    }

    update() {
        // just a main screen for now
        const routine = () => {
            if(!r.WindowShouldClose()) {
                r.BeginDrawing();
                r.ClearBackground(r.BLACK);
                r.DrawText("MaschinePI", 10, 10, 16, r.WHITE);

                r.EndDrawing();            
            }
        };
        this.displayWorker.postMessage(routine.toString());
    }
    
    
}

export enum MK3Displays {
    LEFT,
    RIGHT
}

export class MK3Display implements OutputDisplay {
    width = 480;
    height = 272;
    name: string;
    targetDisplayIndex: MK3Displays;
    controller: MaschineMk3;
    buffer: ArrayBuffer;


    constructor(name: string, target: MK3Displays, controller: MaschineMk3) {
        this.name = name;
        this.controller = controller;
        this.targetDisplayIndex = target;
        this.buffer = this.controller.displays!.createDisplayBuffer();
    }

    update(payload?: any) {
        //this.controller.displays?.paintDisplay(this.targetDisplayIndex, payload, this.buffer);        
    }

    init() {

    }

    deInit() {
        // clear out the display
    }
}

export class MK3DevDisplay extends MK3Display {
    init(): void {
     
    }
}