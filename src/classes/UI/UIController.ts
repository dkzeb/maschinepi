import { CanvasRenderingContext2D } from "canvas";
import { EventBus } from "../EventBus";
import { filter } from "rxjs";
import { MK3Controller, Mk3Display } from "../MK3Controller";
import { SoundEngine } from "../SoundEngine";
import { Widget } from "./widgets/widget";
import { container } from "tsyringe";
export class UIController {
    mk3: MK3Controller;    

    activeWidgets: Widget[] = [];
    ebus: EventBus;
    soundEngine: SoundEngine;
    widgetLayersRight: Widget[] = [];
    widgetLayersLeft: Widget[] = [];    

    constructor(widgets?: Widget[]) {
        this.soundEngine = container.resolve(SoundEngine);
        this.mk3 = container.resolve(MK3Controller);
        this.ebus = container.resolve(EventBus);

        this.ebus.events.pipe(filter(e => e.type === 'LoadWidget')).subscribe(async e => {          
            console.log('Load Widget', e);  
            this.loadWidget(e.data.widgetName, e.data.widgetData ?? {}, e.data.targetMK3Display ?? Mk3Display.left);
        });

        if(widgets) {
            this.activeWidgets = widgets;
        }        

    }
    async loadWidget(widgetName: string, data: any = {}, target: Mk3Display = Mk3Display.left, cb?: () => void) {
        const w = this.activeWidgets.find(w => w.name === widgetName);                
        if(w) {
            console.log('w', 'draw', data);
            w.data = data;
            await w.draw(() => {  
                console.log('we are pushing', target);           
                this.mk3.gfx.pushCanvas(target, w.ctx.canvas);
            });
        } else {
            throw new Error("NO WIDGET NAMED " + widgetName);
        }
        
    }
}

export namespace UI.Utils {
    export const drawAudioBuffer = (ctx: CanvasRenderingContext2D, audioBuffer: AudioBuffer, height: number, width: number, color?: string) => {
        if(color) {
            ctx.fillStyle = color;
        }

        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;
        for(let i = 0; i < width; i++) {
            let min = 1.0, max = -1.0;
            for(let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if(datum < min) {
                    min = datum;
                }
                if(datum > max) {
                    max = datum;
                }
                ctx.fillRect(i, (1+min)*amp,1, Math.max(1, (max-min)*amp));
            }
        }
    }
}