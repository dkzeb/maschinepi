import { Canvas, CanvasRenderingContext2D } from "canvas";
import { MaschineMk3 } from "ni-controllers-lib";
import { EventBus } from "../EventBus";
import { filter } from "rxjs";
import { MK3GraphicsController, Mk3Display } from "../MK3Controller";
import { PrismaClient } from "@prisma/client";
export class UIController {
    mk3: MK3GraphicsController;    

    activeWidgets: Widget[] = [];
    ebus: EventBus;

    constructor(ebus: EventBus, mk3: MK3GraphicsController) {
        this.mk3 = mk3;
        this.ebus = ebus;

        this.ebus.events.pipe(filter(e => e.type === 'LoadWidget')).subscribe(async e => {
            console.log('loading widget', e);
            this.loadWidget('FileList');
        });

        this.activeWidgets = [new FileList("FileList", 480, 272, this.ebus)]

    }
    async loadWidget(widgetName: string, cb?: () => void) {
        const w = this.activeWidgets.find(w => w.name === widgetName);
        if(w) {
            await w.draw(() => {                
                this.mk3.pushCanvas(Mk3Display.left, w.ctx.canvas);
            });
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
    files: string[] = [];
    highlighted: number = -1;
    drawCB?: () => void;

    constructor(name: string, w: number, h: number, ebus: EventBus) {
        super(name, w, h);
        this.prisma = new PrismaClient();

        ebus.events.pipe(filter(e => e.type === 'KnobInput' && e.name === 'navStep')).subscribe(e => {            
            this.highlighted += e.data.direction ?? 0;            
            this.draw();
        });        
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
        this.ctx.font = "10px Impact";
        
        if(this.files.length === 0) {
            await this.listFiles();
        }

        this.files.forEach((f, i) => {
            if(i === this.highlighted) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(10, (20 * i) + 20, this.width - 20, 20);
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(f, 20, 35 + (i * 20));                
            } else {
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(f, 20, 35 + (i * 20));
            }
        });      
        if(this.drawCB) {
            this.drawCB()
        }
    }

    getSelection() {
        return this.files[this.highlighted];
    }

    async listFiles(): Promise<string[]> {
        const res = await this.prisma.sample.findMany();
        this.files = res.map(r => r.name);        
        return this.files;
    }

}