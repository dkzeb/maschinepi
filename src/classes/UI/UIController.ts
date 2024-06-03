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
            new FileList("FileList", 480, 272, this, this.ebus, this.soundEngine),
            new SampleDisplay("SampleDisplay", 480, 272, this, this.soundEngine, this.ebus)
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

type WidgetOption = {
    button: 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8';
    label: string;
    action: (...args: any) => void;
    active?: boolean;
}

export abstract class Widget {
    controller: UIController;
    name: string;
    title: string = '';
    ctx: CanvasRenderingContext2D;    
    width: number;
    options: WidgetOption[] = [];
    height: number;
    gfx: Canvas;
    data?: unknown;
    menuWasInit: boolean = false;

    constructor(name: string, w: number, h: number, controller: UIController) {
        this.name = name;
        this.width = w;
        this.height = h;
        this.controller = controller;
        
        this.gfx = new Canvas(w, h, "image");
        this.ctx = this.gfx.getContext('2d');
    }

    initMenu() {
        if(!this.menuWasInit) {
            this.options.forEach(o => {             
                // hookup the button
                this.controller.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':pressed')).subscribe(() => {
                    o.action(o);
                    this.controller.mk3.setLED(o.button, 10000);
                    this.draw();
                });
    
                this.controller.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':released')).subscribe(() => {
                    this.controller.mk3.setLED(o.button, 255);
                    this.draw();
                });
                this.controller.mk3.setLED(o.button, 255);            
            });
            this.menuWasInit = true;
        }
    }

    drawMenu() {
        if(this.options.length === 0) {
            return;
        }
        this.ctx.textAlign = 'center';
        const optionWidth = this.width/4;
        const menuHeight = 20;
        this.ctx.strokeStyle = 'white';
        this.ctx.fillStyle = 'white';
        this.options.forEach(o => {            


            if(o.button === 'd1' || o.button === 'd5') {
                this.drawMenuOption(o, 0, 0, optionWidth, menuHeight)                                
            } else if(o.button === 'd2' || o.button === 'd6') {                                
                this.drawMenuOption(o, optionWidth, 0, optionWidth, menuHeight)                
            } else if(o.button === 'd3' || o.button === 'd7') {                
                this.drawMenuOption(o, optionWidth * 2, 0, optionWidth, menuHeight);                              
            } else if(o.button === 'd4' || o.button === 'd8') {
                this.drawMenuOption(o, optionWidth * 3, 0, optionWidth, menuHeight);                
            }            
        });

        this.initMenu();
        // reset alignment
        this.ctx.textAlign = 'start';
    }    

    private drawMenuOption(o: WidgetOption, x, y, w, h) {
        const origFont = this.ctx.font;
        this.ctx.font = '12px sans-serif';
        if(o.active) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(x, y, w, h);
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(o.label, x + (w / 2), 15);
            this.ctx.fillStyle = 'white';
        } else {
            this.ctx.strokeRect(x, y, w, h);
            this.ctx.fillText(o.label, x + (w / 2), 15);
        }
        this.ctx.font = origFont;
    }

    drawTitleBar() {
        if(!this.title) {
            this.title = this.name;
        }
        const titlebarStart = 30;
        const origFont = this.ctx.font;
        const titlebarHeight = 20;
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.moveTo(0, titlebarStart);
        this.ctx.lineTo(this.width, titlebarStart);
        this.ctx.moveTo(0, titlebarStart + titlebarHeight);
        this.ctx.lineTo(this.width, titlebarStart + titlebarHeight);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText(this.title, 20, titlebarStart + (titlebarHeight - 5));
        this.ctx.font = origFont;

    }

    abstract draw(cb?: () => void);
}

export class FileList extends Widget {
    prisma: PrismaClient;
    files: Sample[] = [];
    highlighted: number = -1;
    title = 'Load Sample';
    previewEnabled: boolean = false;
    page = 1;
    maxLinesPrPage = 10;
    options: WidgetOption[] = [
        {
            label: 'Back',
            button: 'd1',
            action: () => console.log('back back')
        },
        {
            label: 'Live Preview',
            button: 'd4',
            action: (o: WidgetOption) => {
                this.previewEnabled = !this.previewEnabled;
                o.active = this.previewEnabled;
            }
        }
    ]
    ebus: EventBus;
    drawCB?: () => void;
    soundEngine: SoundEngine;

    constructor(name: string, w: number, h: number, controller: UIController, ebus: EventBus, soundEngine: SoundEngine) {
        super(name, w, h, controller);
        this.soundEngine = soundEngine;
        this.prisma = new PrismaClient();
        this.ebus = ebus;

        ebus.events.pipe(filter(e => e.type === 'KnobInput' && e.name === 'navStep')).subscribe(e => {
            this.highlighted += e.data.direction ?? 0;                        
            this.page = this.highlighted > 0 ? Math.ceil((this.highlighted) / this.files.length * Math.ceil(this.files.length / this.maxLinesPrPage)) : 1;

            if(this.highlighted < 0) {
                this.highlighted = 0;
            } else {                
                this.draw();
                if(this.previewEnabled) {
                    this.loadSampleDisplay();
                }
            }
        });

        ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === 'navPush:pressed')).subscribe(e => {
            this.selectSampleByIndex();   
            this.loadSampleDisplay();
        });
        
    }

    loadSampleDisplay() {
        this.ebus.processEvent({
            type: 'LoadWidget',
            data: {
                widgetName: 'SampleDisplay',
                widgetData: {
                    sample: this.files[this.highlighted],
                    preview: this.previewEnabled
                },
                targetMK3Display: Mk3Display.right
            }
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

        this.ctx.font = "10px Impact";
        
        if(this.files.length === 0) {
            await this.listFiles();
        }

        const heightOffset = 35;
        
        this.paginate(this.files, this.maxLinesPrPage, this.page).forEach((f, i) => {
            if((i + 1) % this.maxLinesPrPage === this.highlighted) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(10, heightOffset + (20 * (i % 10)) + 20, this.width - 20, 20);
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(f.name, 20, heightOffset + 35 + ((i % 10) * 20));                
            } else {
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(f.name, 20, heightOffset + 35 + ((i % 10) * 20));
            }
        });      

        this.drawMenu();
        this.drawTitleBar();

        if(this.drawCB) {
            this.drawCB()
        }
    }

    private paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * page_size, page_number * page_size);
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
    data: { sample?: Sample, preview?: boolean } = {};
    didAddSource: boolean = false;
    drawCB?: () => void;
    options: WidgetOption[] = [
        {
            label: 'Preview',
            button: 'd7',
            action: () => this.playPreview()
        },
        {
            label: 'Load Sample',
            button: 'd8',
            action: (o: WidgetOption) => {
                console.log('woop woop', 'load it')
            }
        }
    ]
    eventBus: EventBus;
    
    constructor(name: string, w: number, h: number, controller: UIController, soundEngine: SoundEngine, ebus: EventBus) {
        super(name, w, h, controller);
        this.soundEngine = soundEngine;        
        this.eventBus = ebus;      
    }    

    playPreview() {
        if(this.data && this.data.sample)
            this.soundEngine.play(this.data.sample.name);
    }

    async draw(cb?: (() => void) | undefined) {

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }
        console.log('we drawing', this.data);
        if(!this.data.sample) {
            return;
        } else {            
            if(this.data.preview) {                
                this.playPreview();
            }
            
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0,0,this.width,this.height);
            this.ctx.fillStyle = 'white';
            
            this.title = this.data.sample.name;
            this.drawMenu();
            this.drawTitleBar();

            // hookup the options buttons
            this.controller.mk3.setLED('d7', 10000);            
            this.controller.mk3.setLED('d8', 10000);

            await this.soundEngine.drawAudioBuffer(this.ctx, this.data.sample.data, 190, 480, 0, 65);
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