import { CanvasRenderingContext2D } from "canvas";
import { EventBus } from "../EventBus";
import { filter } from "rxjs";
import { MK3GraphicsController, Mk3Display } from "../MK3Controller";
import { SoundEngine } from "../SoundEngine";
import { Widget } from "./widgets/widget";
import { FileList } from "./widgets/fileList.widget";
import { SampleDisplay } from "./widgets/sampleDisplay.widget";
import { PadModeWidgetLeft, PadModeWidgetRight } from "./widgets/padMode.widget";
export class UIController {
    mk3: MK3GraphicsController;    

    activeWidgets: Widget[] = [];
    ebus: EventBus;
    soundEngine: SoundEngine;

    constructor(ebus: EventBus, mk3: MK3GraphicsController, soundEngine: SoundEngine) {
        this.soundEngine = soundEngine;
        this.mk3 = mk3;
        this.ebus = ebus;

        this.ebus.events.pipe(filter(e => e.type === 'LoadWidget')).subscribe(async e => {            
            this.loadWidget(e.data.widgetName, e.data.widgetData ?? {}, e.data.targetMK3Display ?? Mk3Display.left);
        });

        this.activeWidgets = [
            new FileList({ name: "FileList", width: 480, height: 272}),
            new SampleDisplay({ name: "SampleDisplay", width: 480, height: 272 }),
            new PadModeWidgetLeft({
                name: 'PadModeWidgetLeft', 
                width: 480, 
                height: 272}),
            new PadModeWidgetRight({
                name: 'PadModeWidgetRight', 
                width: 480, 
                height: 272})
        ];

    }
    async loadWidget(widgetName: string, data: any = {}, target: Mk3Display = Mk3Display.left, cb?: () => void) {
        const w = this.activeWidgets.find(w => w.name === widgetName);
        console.log('w', w);
        if(w) {
            w.data = data;
            await w.draw(() => {             
                this.mk3.pushCanvas(target, w.ctx.canvas);
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