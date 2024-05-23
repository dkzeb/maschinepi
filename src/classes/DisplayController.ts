import * as r from 'raylib';

import { EventBus } from "./EventBus";
import { filter } from 'rxjs';

const SCREENWIDTH = 480;
const SCREENHEIGHT = 240;

type OutputDisplay = {
    name: string;
    width: number;
    height: number;
    init: () => void;
    deInit: () => void;
    update: () => void;
}

export class DisplayController {

    displays: OutputDisplay[] = [
        new MainDisplay()
    ]
    ebus: EventBus;

    constructor(ebus: EventBus) {
        this.ebus = ebus;
        this.displays.forEach(d => {
            d.init();
        })

        this.ebus.events.pipe(filter(t => t.type === 'UpdateDisplay')).subscribe(() => {
            this.displays.forEach(d => d.update());
        });
    }
    
    deInit() {
        this.displays.forEach(d => {
            d.deInit();
        })
    }
}

class MainDisplay implements OutputDisplay {
    name: string = 'MainDisplay'
    width: number = 840;
    height: number = 420;

    init() {
        r.InitWindow(this.width, this.height, 'MaschinePI');
        r.SetTargetFPS(30);   
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