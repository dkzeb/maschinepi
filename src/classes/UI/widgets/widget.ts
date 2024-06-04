import { Canvas, CanvasRenderingContext2D } from "canvas";
import { Subscription, filter } from "rxjs";
import { UIController } from "../UIController";
import { container } from "tsyringe";
import { EventBus } from "src/classes/EventBus";
import { MK3Controller } from "src/classes/MK3Controller";

export type WidgetOption = {
    button: 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8';
    label: string;
    action: (...args: any) => void;
    active?: boolean;
}

export type WidgetConfig = {
    name: string;
    width: number;
    height: number;
}

export abstract class Widget {    
    name: string;
    title: string = '';
    mk3Controller: MK3Controller;
    ctx: CanvasRenderingContext2D;    
    width: number;
    options: WidgetOption[] = [];
    height: number;
    gfx: Canvas;
    data?: unknown; 
    menuWasInit: boolean = false;

    widgetSubscriptions: Subscription[] = [];
    ebus: EventBus;

    constructor(config: WidgetConfig) {
        this.name = config.name;
        this.width = config.width;
        this.height = config.height;

        this.ebus = container.resolve(EventBus);
        this.mk3Controller = container.resolve(MK3Controller);
        
        this.gfx = new Canvas(this.width, this.height, "image");
        this.ctx = this.gfx.getContext('2d');
    }

    initMenu() {
        if(!this.menuWasInit) {
            this.options.forEach(o => {             
                // hookup the button
                const pressSub = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':pressed')).subscribe(() => {
                    o.action(o);
                    this.mk3Controller.mk3.setLED(o.button, 10000);
                    this.draw();
                });
    
                const releaseSub = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':released')).subscribe(() => {
                    this.mk3Controller.mk3.setLED(o.button, 255);
                    this.draw();
                });
                this.mk3Controller.mk3.setLED(o.button, 255);            
                this.widgetSubscriptions.push(pressSub);
                this.widgetSubscriptions.push(releaseSub);
            });
            this.menuWasInit = true;
        }
    }

    destroy() {
        this.widgetSubscriptions.forEach(s => {
            s.unsubscribe();
        });
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

    resolve() {
        this.result();
        this.destroy();
    }

    abstract draw(cb?: () => void);

    abstract result();
}