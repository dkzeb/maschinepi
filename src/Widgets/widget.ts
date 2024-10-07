import { Canvas, CanvasRenderingContext2D } from "canvas";
import { filter } from "rxjs";
import { EventBus, MPIEvent } from "../Core/EventBus";
import { container } from "tsyringe";

export type WidgetEvent = MPIEvent & {
    data: WidgetData
}

type WidgetData = any;

interface IWidget {  
  render(): Promise<string> | string;  
  add?(widget: IWidget): void;
  remove?(widget: IWidget): void;
  getChild?(index: number): IWidget | undefined;
};

export enum WidgetOptionButton {
    d1, d2, d3, d4, d5, d6, d7, d8
}

export type WidgetOptions = {
    canvas?: Canvas,
    eventTags: string[],    
    children?: Widget<any>[],
    options?: WidgetOption[],
    targetDisplay?: 'left' | 'right' | 'main'
}

export type WidgetOption = {
    label: string;
    handler: (...args: any[]) => void | {};
    toggled?: boolean;
    button: WidgetOptionButton
}

export abstract class Widget<T> implements IWidget {    

    discriminator: string = 'WIDGET';
    canvas?: Canvas;
    ctx?: CanvasRenderingContext2D;    
    children?: Widget<any>[];
    pages?: any[] = [];
    options?: WidgetOption[];
    targetDisplay?: 'left' | 'right' | 'main'

    drawLayout?: (ctx: CanvasRenderingContext2D) => void;

    getImageData() {
        return this.renderWidget();        
    }

    abstract render(): Promise<string>;
    ebus: EventBus = container.resolve(EventBus);

    constructor(widgetOpts: WidgetOptions) {
        widgetOpts.eventTags.forEach(etag => {
            this.ebus.events.pipe(filter(ev => ev.type === etag)).subscribe(ev => {            
                console.log('Widget Event Caught', ev);
            });
        });
        
        this.options = widgetOpts.options;
        this.children = widgetOpts.children;        
        this.canvas = widgetOpts.canvas ?? new Canvas(480, 272, 'image');    
        this.targetDisplay = widgetOpts.targetDisplay;
        this.ctx = this.canvas?.getContext("2d");
    }

    async renderWidget() {
        if(this.options?.length) {
            this.drawMenu();
        }
        return await this.render();
    }

    drawMenu() {        
        if(!this.ctx || !this.options || this.options.length === 0) {
            return;
        }
        const origFillStyle = this.ctx.fillStyle;
        const origStrokeStyle = this.ctx.strokeStyle;
        const ctxFont = this.ctx.font;

        this.ctx.font = '16px "Impact"';

        this.ctx.textAlign = 'center';
        const optionWidth = this.canvas!.width/4;
        const menuHeight = 20;
        this.ctx.strokeStyle = 'white';
        this.ctx.fillStyle = 'white';
        this.options.forEach(o => {                        

            if(o.button === WidgetOptionButton.d1 || o.button === WidgetOptionButton.d5) {
                this.drawMenuOption(o, 0, 0, optionWidth, menuHeight)                                
            } else if(o.button === WidgetOptionButton.d2 || o.button === WidgetOptionButton.d6) {                                
                this.drawMenuOption(o, optionWidth, 0, optionWidth, menuHeight)                
            } else if(o.button === WidgetOptionButton.d3 || o.button === WidgetOptionButton.d7) {                
                this.drawMenuOption(o, optionWidth * 2, 0, optionWidth, menuHeight);                              
            } else if(o.button === WidgetOptionButton.d4 || o.button === WidgetOptionButton.d8) {
                this.drawMenuOption(o, optionWidth * 3, 0, optionWidth, menuHeight);                
            }            
        });        
        // reset alignment
        this.ctx.textAlign = 'start';
        
        this.ctx.fillStyle = origFillStyle;
        this.ctx.strokeStyle = origStrokeStyle;        
        this.ctx.font = ctxFont;
    }    

    private drawMenuOption(o: WidgetOption, x, y, w, h) {
        if(!this.ctx) {
            return; 

        }
        const origFont = this.ctx.font;
        this.ctx.font = '12px sans-serif';
        if(o.toggled) {
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

    clearScreen() {
        if(this.ctx && this.canvas) {
            const lastStyle = this.ctx.fillStyle;
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fill();
            this.ctx.fillStyle = lastStyle;
        }
    }
}
