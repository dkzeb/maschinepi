import { Canvas, CanvasRenderingContext2D } from "canvas";
import { EventBus } from "../EventBus";
import { filter } from "rxjs";
import { MK3GraphicsController, Mk3Display } from "../MK3Controller";
import { PrismaClient, Sample } from "@prisma/client";
import { SoundEngine } from "../SoundEngine";
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
            new FileList("FileList", 480, 272, this.ebus, this.soundEngine),
            new SampleDisplay("SampleDisplay", 480, 272, this.soundEngine)
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


/**
 * A widget is a smaller ui element that basically runs like its entire program.
 * a widget can be almost anything, like a dialog/popup or a FileList
 */
type WConfig = {
    display: 'left' | 'right';
}
export abstract class Widget {
    name: string;
    ctx: CanvasRenderingContext2D;    
    width: number;
    height: number;
    gfx: Canvas;
    data?: unknown;
    constructor(name: string, w: number, h: number) {
        this.name = name;
        this.width = w;
        this.height = h;
        
        this.gfx = new Canvas(w, h, "image");
        this.ctx = this.gfx.getContext('2d');
    }    

    abstract draw(cb?: () => void);
}

export class FileList extends Widget {
    prisma: PrismaClient;
    files: Sample[] = [];
    highlighted: number = -1;
    drawCB?: () => void;
    soundEngine: SoundEngine;

    constructor(name: string, w: number, h: number, ebus: EventBus, soundEngine: SoundEngine) {
        super(name, w, h);
        this.soundEngine = soundEngine;
        this.prisma = new PrismaClient();

        ebus.events.pipe(filter(e => e.type === 'KnobInput' && e.name === 'navStep')).subscribe(e => {
            this.highlighted += e.data.direction ?? 0;            
            this.draw();
        });

        ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === 'navPush:pressed')).subscribe(e => {
            this.selectSampleByIndex();
            ebus.processEvent({
                type: 'LoadWidget',
                data: {
                    widgetName: 'SampleDisplay',
                    widgetData: {
                        sample: this.files[this.highlighted]
                    },
                    targetMK3Display: Mk3Display.right
                }
            })
        });
    }

    selectSampleByIndex() {
        console.log('selected', this.files[this.highlighted]);

    }

    async draw(cb?: () => void) {        
        if(this.highlighted < 0) {
            this.highlighted = 0;
        }

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = "16px Impact";
        this.ctx.fillText("FileList", 10, 15);

        this.ctx.fillText("Live Preview", this.width - 100, 15);

        this.ctx.font = "10px Impact";
        
        if(this.files.length === 0) {
            await this.listFiles();
        }

        this.files.forEach((f, i) => {
            if(i === this.highlighted) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(10, (20 * i) + 20, this.width - 20, 20);
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(f.name, 20, 35 + (i * 20));                
            } else {
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(f.name, 20, 35 + (i * 20));
            }
        });      
        if(this.drawCB) {
            this.drawCB()
        }
    }

    getSelection() {
        return this.files[this.highlighted];
    }

    async listFiles(): Promise<Sample[]> {        
        this.files = await this.prisma.sample.findMany();
        return this.files;
    }

}

export class SampleDisplay extends Widget {
    name = 'SampleDisplay';
    soundEngine: SoundEngine;
    data: { sample?: Sample } = {};
    drawCB?: () => void;
    
    constructor(name: string, w: number, h: number, soundEngine: SoundEngine) {
        super(name, w, h);
        this.soundEngine = soundEngine;        
    }    

    async draw(cb?: (() => void) | undefined) {

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }
        console.log('we drawing', this.data);
        if(!this.data.sample) {
            return;
        } else {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = "16px Impact";
            this.ctx.fillText(`${this.data.sample?.name} (Preview)`, 10, 15);

            this.ctx.fillText("Play Preview", this.width - 100, 15);

            // hookup the listener            

            await this.soundEngine.drawAudioBuffer(this.ctx, this.data.sample.data, 200, 480, 0, 50);
        }

        if(this.drawCB) {
            this.drawCB()
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