import { Canvas, CanvasRenderingContext2D } from "canvas";
import { Subscription, filter } from "rxjs";
import { UIController } from "../UIController";
import { container } from "tsyringe";
import { EventBus } from "../../EventBus";
import { MK3Controller, Mk3Display } from "../../MK3Controller";

export type WidgetOption = {
    button: 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8';
    label: string;
    action: (...args: any) => void;
    active?: boolean;
}

export type WidgetConfig = {
    name: string;
    targetDisplay: Mk3Display;
    hasMenu?: boolean;
    hasTitlebar?: boolean;
    width?: number;
    height?: number;
    isModeRootWidget?: boolean;
}

export abstract class Widget {    
    name: string;
    title: string = '';
    mk3Controller: MK3Controller;
    ctx: CanvasRenderingContext2D;    
    options: WidgetOption[] = [];
    width: number = 480;
    height: number = 272;
    gfx: Canvas;
    data?: unknown; 
    target: Mk3Display;
    menuWasInit: boolean = false;
    isModeRootWidget: boolean = false;
    widgetSubscriptions: Subscription[] = [];
    hasTitlebar: boolean;
    hasMenu: boolean;
    ebus: EventBus;    

    constructor(config: WidgetConfig) {
        this.name = config.name;
        if(config.height && config.width) {
            this.width = config.width;
            this.height = config.height;
        }
        if(config.isModeRootWidget) {
            this.isModeRootWidget = config.isModeRootWidget
        }

        this.hasMenu = config.hasMenu ?? false;
        this.hasTitlebar = config.hasTitlebar ?? false;
        this.target = config.targetDisplay;

        this.ebus = container.resolve(EventBus);
        this.mk3Controller = container.resolve(MK3Controller);
        
        this.gfx = new Canvas(this.width, this.height, "image");
        this.ctx = this.gfx.getContext('2d');
    }

    /**
     * Init method, clearing all previous subscriptions and calls setup on the widget
     */
    init() {
        this.widgetSubscriptions.forEach(s => s.unsubscribe());
        this.widgetSubscriptions = [];
        this.menuWasInit = false;        
        this.initMenu();
        this.setup();        
    }

    initMenu() {
        if(!this.menuWasInit) {            
            this.options.forEach(o => {             
                // hookup the button
                const pressSub = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':pressed')).subscribe(() => {
                    o.action(o);
                    this.mk3Controller.mk3.setLED(o.button, 10000);
                    this.update();
                });
    
                const releaseSub = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === o.button + ':released')).subscribe(() => {
                    this.mk3Controller.mk3.setLED(o.button, 255);
                    this.update();
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
        this.widgetSubscriptions = [];
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

    abstract setup();

    async update() {
        await this.draw();        
        if(this.hasTitlebar) {
            this.drawTitleBar();
        }
        if(this.hasMenu) {
            this.drawMenu();
        }
        this.mk3Controller.gfx.pushCanvas(this.target, this.gfx);
    }

    abstract draw();
}