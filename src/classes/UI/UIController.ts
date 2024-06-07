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
    left: WidgetLayers = new WidgetLayers();
    right: WidgetLayers = new WidgetLayers();

    constructor(widgets?: Widget[]) {
        this.soundEngine = container.resolve(SoundEngine);
        this.mk3 = container.resolve(MK3Controller);
        this.ebus = container.resolve(EventBus);

        this.ebus.events.pipe(filter(e => e.type === 'LoadWidget')).subscribe(async e => {            
            await this.loadWidget(e.data.widgetName, e.data.widgetData ?? {}, e.data.targetMK3Display ?? Mk3Display.left);
        });

        this.ebus.events.pipe(filter(e => e.type === 'CloseWidget')).subscribe(async e => {                                  
            await this.closeWidget(e.data.targetMK3Display);
        });

        this.ebus.events.pipe(filter(e => e.type === 'UpdateWidget')).subscribe(async e => {
            await this.tick();
        });

        if(widgets) {
            this.activeWidgets = widgets;
        }        

    }
    async loadWidget(widgetName: string, data: any = {}, target: Mk3Display = Mk3Display.left) {        
        const w = this.activeWidgets.find(w => w.name === widgetName);     
        if(w) {            
            w.data = data;
            if(target == Mk3Display.left) {
                this.left.addWidget(w);    
            } else if(target === Mk3Display.right) {                
                this.right.addWidget(w);
            }
            w.init();
            await w.update();
        } else {
            throw new Error("NO WIDGET NAMED " + widgetName);
        }        
    }

    async closeWidget(target: Mk3Display) {        
        if(target === Mk3Display.both) {
            await this.closeWidget(Mk3Display.left);
            await this.closeWidget(Mk3Display.right);
        } else {
            if(target === Mk3Display.left) {            
                this.left.removeWidget();                                
            } else {
                this.right.removeWidget();                
            }        
            await this.tick();
        }

    }    

    async tick() {
        await this.left.update();
        await this.right.update();
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


class WidgetLayers {
    widgets: Widget[] = [];

    addWidget(w: Widget) {
        if(this.widgets.length > 0) {
            // if same type, replace
            const top = this.widgets[this.widgets.length - 1];
            if(w.name === top.name) {
                this.widgets.pop();            
            }        
            this.widgets.push(w);        
        } else {
            this.widgets.push(w);
        }
    }

    removeWidget() {
        if(this.widgets.length > 1) {
            const w = this.widgets.pop();
            console.log('closing', w?.name);
            w?.destroy();
            console.log('active widget', this.getTopWidget().name);
        }
    }

    getTopWidget() {
        return this.widgets[this.widgets.length - 1];
    }

    async update() {
        await this.getTopWidget().update();
    }
}