import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Widget } from 'src/Widgets/widget';

export type DisplayOptions = {
    name: string;    
    height: number;
    width: number;
    type: DisplayType;    
}

export enum DisplayType {
    MK3Display,
    PiDisplay,
    DEVDisplay
}

export type TextOptions = {
    text: string, 
    position?: { x: number, y: number }, 
    size?: number, 
    anchor?: 'left' | 'right' | 'center';
}

export type UILayer = {
    cvs: Canvas,
    layerBuffer: ArrayBuffer,
    layerIndex?: number
}

export abstract class Display {
    options: DisplayOptions;
    cvs: Canvas;
    displayBuffer: ArrayBuffer;

    widgets: Set<Widget> = new Set();

    layers: UILayer[] = [];

    public set shouldUpdate(should: boolean) {
        if(should === false) {
            this._shouldUpdate = false;
            this._drawRoutine = () => {};
        } else {
            this._shouldUpdate = true;            
        }
    }
    get shouldUpdate(): boolean {
        return this._shouldUpdate;
    }
    private _shouldUpdate: boolean = true;

    ctx: CanvasRenderingContext2D | null = null;
    
    public set drawRoutine(routine: (ctx: CanvasRenderingContext2D) => void) {
        this._drawRoutine = routine;
        this.shouldUpdate = true;
    }
    private _drawRoutine?: (ctx: CanvasRenderingContext2D) => void;

    constructor(options: DisplayOptions) {
        this.cvs = new Canvas(options.width, options.height);
        this.options = options;

        this.displayBuffer = this.createDisplayBuffer();
    }

    abstract sendImage(...args: any[]);

    abstract sendText(textOpts: TextOptions);

    clear() {
        if(this.ctx) {
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.options.width, this.options.height);
            this.ctx.fill();
        }
    }

    draw(): void {
        if(this.ctx && this._drawRoutine && this.shouldUpdate) {                    
            this._drawRoutine(this.ctx);            
            this.shouldUpdate = false;
        }
    }

    addWidget(w: Widget) {
        console.log('Adding widget');
        console.dir(w);
        this.widgets.add(w);
    }

    createDisplayBuffer(): ArrayBuffer {
        const HEADER_LENGTH = 16;
        const COMMAND_LENGTH = 4;
        const PIXEL_LENGTH = 2;
        return new ArrayBuffer(HEADER_LENGTH +
            COMMAND_LENGTH * 3 +
            this.options.width * this.options.height * PIXEL_LENGTH);
    }
}