import { Canvas, CanvasRenderingContext2D, Image } from "canvas";
import { filter, Subscription } from "rxjs";
import { EventBus, MPIEvent } from "../Core/EventBus";
import { container } from "tsyringe";
import { MK3Controller } from "../Hardware/MK3Controller";
import { StorageController } from "../Core/StorageController";
import * as zlib from 'zlib';

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
    children?: Widget<any>[],
    options?: WidgetOption[],
    discriminator: string;
    targetDisplay?: 'left' | 'right' | 'main'
}

export type WidgetOption = {
    label: string;
    handler: (...args: any[]) => void | {};
    toggled?: boolean;
    button: WidgetOptionButton
}

export type UILayer = {
    index: number;
    data: Image
}

export abstract class Widget<T> implements IWidget {    

    discriminator: string;
    canvas?: Canvas;
    ctx?: CanvasRenderingContext2D;    
    children?: Widget<any>[];
    pages?: any[] = [];
    options?: WidgetOption[];
    optionSubscriptions?: Subscription[];
    targetDisplay?: 'left' | 'right' | 'main';        
    uiAsset: Set<UILayer> = new Set();
    storage: StorageController = container.resolve(StorageController);

    drawLayout?: (ctx: CanvasRenderingContext2D) => void;

    getImageData() {
        return this.renderWidget();        
    }
    
    abstract render(): Promise<string>;
    ebus: EventBus = container.resolve(EventBus);
    controller: MK3Controller = container.resolve(MK3Controller);

    constructor(widgetOpts: WidgetOptions) {                
        this.options = widgetOpts.options;        
        this.discriminator = widgetOpts.discriminator;        
        this.children = widgetOpts.children;        
        this.canvas = widgetOpts.canvas ?? new Canvas(480, 272, 'image');    
        this.targetDisplay = widgetOpts.targetDisplay;
        this.ctx = this.canvas?.getContext("2d");

        this.checkForUIAsset();
    }

    async renderWidget() {

        if(this.uiAsset.size > 0) {
            [...this.uiAsset].sort((a,b) => b.index - a.index).forEach(layer => {
                this.ctx?.drawImage(layer.data, 0, 0);
            });
        }

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
            
            // hook up the option event handler
            this.ebus.events.pipe(filter(ev => ev.type === 'ButtonInput' && ev.name?.indexOf(WidgetOptionButton[o.button]) === 0)).subscribe((ev) => {
                if(ev.name!.indexOf('pressed') > -1) {
                    o.handler();
                    o.toggled = true;
                } else {
                    o.toggled = false;
                }
            });

            // set the widget option state on the controller
            this.controller.setLED(WidgetOptionButton[o.button], 500);
            
            
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

    private async checkForUIAsset() {
        const assets = await this.storage.loadWidgetUI('widgets/' + this.discriminator);
        console.log('Assets?', assets);
        assets.forEach(a => this.uiAsset.add(a));
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
