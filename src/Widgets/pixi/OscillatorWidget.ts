import { DisplayObject } from "@pixi/node";
import { PixiWidget } from "./PixiWidget";
import { Text } from '@pixi/node';
import { filter } from "rxjs";


export class OscillatorWidget extends PixiWidget {
    
    constructor() {
        super({
            name: 'OscillatorWidget',
            dims: {
                x: 0, y: 0, w: 480 * 2, h: 272
            },
            options: [
                {
                    ui: {
                        label: 'Test',
                        slot: 0
                    },
                    buttonId: 'd1',
                    cb: () => { console.log('testing!') }
                },
            ],
            themeBg: true
        });

        this.setupPadEvents();
    }

    setupPadEvents() {
        this.ebus.events.pipe(filter(e => e.type === 'PadInput')).subscribe(ev => {
            const evSplit = ev.name?.split(':');            
            console.log(evSplit);
        });
    }

    override draw(): DisplayObject {
        const container = this.containers.main;
        container.removeChildren(0);

        const txt = new Text("OscillatorWidget", {
            fill: '#ffffff'
        });
        txt.x = 10;
        txt.y = 10;
        container.addChild(txt);
        return super.draw();
    }

}