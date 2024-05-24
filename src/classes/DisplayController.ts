import * as r from 'raylib';

import { EventBus, MPIEvent } from "./EventBus";

import { MaschineMk3 } from 'ni-controllers-lib';
import { filter } from 'rxjs';

type OutputDisplay = {
    name: string;
    width: number;
    height: number;
    init: () => void;
    deInit: () => void;
    update: (...args: unknown[]) => void;
}

type UpdateDisplayEventData = {
    target: string;
    payload: any;
}

interface UpdateDisplayEvent extends MPIEvent {
    data?: UpdateDisplayEventData;
}

export class DisplayController {

    displays: OutputDisplay[] = [
        new MainDisplay(),
        new MK3DevDisplay('MKLeft', MK3Displays.LEFT),
        new MK3DevDisplay('MKLeft', MK3Displays.RIGHT),
    ]
    ebus: EventBus;

    constructor(ebus: EventBus) {
        this.ebus = ebus;
        this.displays.forEach(d => {
            d.init();
        })

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

    init() {
        r.SetTargetFPS(30);
        r.InitWindow(this.width, this.height, 'MaschinePI');
    }

    deInit() {
        r.CloseWindow();
    }

    update() {
        if(!r.WindowShouldClose()) {
            r.BeginDrawing();
            // update with something right here - not sure what yet, for now - set some text :) 
            r.ClearBackground(r.BLACK);
            r.DrawText("MaschinePI", 100, 100, 50, r.WHITE);
            r.EndDrawing();
        }
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

    constructor(name: string, target: MK3Displays) {
        this.name = name;
        this.targetDisplayIndex = target;
    }

    update(payload?: any) {
        if(payload) {

        }
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