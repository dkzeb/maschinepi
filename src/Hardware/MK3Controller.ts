import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import * as jpeg from 'jpeg-js';
import { UIController } from "../UI/UIController";
import { container, singleton } from "tsyringe";
import { Display, DisplayType, TextOptions } from "../UI/display";
import { Canvas, loadImage, registerFont } from "canvas";
import { EventBus } from "../Core/EventBus";

export enum DisplayTarget {
    Left,
    Right,
    /**
     * currently unsused, but planned for implementation 
     * add support for both LR displays, and main 7 inch
     */
    Both,
    Main
}

export class HardwareDisplay extends Display {    
    
    displayBuffer: ArrayBuffer;        
    controller: MaschineMk3;

    constructor(name: string, displayTarget: DisplayTarget, controller: MaschineMk3) {
        super({
            name,
            width: 480,
            height: 272,
            type: DisplayType.MK3Display,
            displayTarget
        });        
        this.controller = controller;
        this.displayBuffer = controller.displays!.createDisplayBuffer();
    }

    override async draw(): Promise<void> {        
        if(this.drawRoutine && this.ctx) {
            super.draw();                
            this.drawRoutine(this.ctx);
            this.pushCanvas();
        }            
    }    

    override sendText(opts: TextOptions) {        
        if(this.ctx) {                                                            
            this.ctx.clearRect(0,0,this.cvs.width, this.cvs.height);            
            const fillStyle = this.ctx!.fillStyle;                
            this.ctx!.fillStyle = 'white';
            this.ctx!.fillText(opts.text, opts.position?.x ?? 10, opts.position?.y ?? 10, this.options.width - (opts.position?.x ?? 10));                
            this.ctx!.fillStyle = fillStyle;                
            this.pushCanvas();        
        } else {
            console.warn("No this.ctx for display", this.options.name);
        } 
        this.draw();        
    }    

    override clear() {
        this.controller.displays?.paintDisplay(this.options.displayTarget, Uint8Array.from([0]), this.displayBuffer);
    }

    sendImage(imgData: Buffer, display: DisplayTarget, skipParse?: boolean)
    sendImage(imgData: Uint8Array, display: DisplayTarget)    
    sendImage(imgData: Uint8Array | Buffer, display: DisplayTarget, skipParse = false) {        
        if(typeof imgData === 'string') {            
            loadImage(imgData).then((img) => {
                this.ctx?.drawImage(img, 0, 0);
                return this.pushCanvas();
            });
        }                
        
        if(Buffer.isBuffer(imgData) && !skipParse) {
            const decoded = jpeg.decode(imgData, { useTArray: true, formatAsRGBA: false });
            imgData = decoded.data;
        }                
        this.controller.displays!.paintDisplay(this.displayTarget, imgData, this.displayBuffer);
    }    

    pushCanvas(display?: DisplayTarget, canvas?: Canvas) {
        if(!display) {
            console.log('no display target, setting to:', this.options.displayTarget)
            display = this.options.displayTarget;
        }
        if(!canvas) {
            canvas = this.cvs;
        }        
        canvas.toBuffer((err, buff) => {
            if(err) {
                throw err;
            }
            this.sendImage(buff, display);
        }, 'image/jpeg', {
            quality: 1
        });
    }
}

@singleton()
export class MK3Controller {

    hardware: MaschineMk3;
    connected: boolean = false;
    ebus: EventBus = container.resolve(EventBus);
    UI: UIController = container.resolve(UIController);
    displays: {
        left?: Display | HardwareDisplay,
        right?: Display | HardwareDisplay,
    } = {};

    constructor() {

        process.env.PANGOCAIRO_BACKEND = 'fontconfig';        
        registerFont(require('@canvas-fonts/impact'), { family: "Impact" });        
        /*registerFont(path.join(fontFolder, 'graphik', 'GraphikRegular.otf'), {
            family: 'Graphik',
            weight: 'regular'
        });*/
        this.hardware = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);                
    }

    async init() {        
        await this.hardware.init();        
        this.connected = true;
        if(this.hardware.displays) {
            // create the two display instances
            this.displays.left = new HardwareDisplay("MK3Left", DisplayTarget.Left, this.hardware);
            this.displays.right = new HardwareDisplay("MK3Right", DisplayTarget.Right, this.hardware);
            this.UI.registerDisplay(this.displays.left);
            this.UI.registerDisplay(this.displays.right);
        }

        if(this.hardware.buttons) {
            this.setupEvents();
        }

        this.allLEDsOff(); // get rdy!
    }

    setLED(which: string, strenght: number = 63, off?: boolean) {
        if(!this.connected) return;

        const led = this.hardware.leds[which];        
        if(off) {
            led.setOff();
        } else {
            //this.hardware.setLED(which, strenght);                
            led.setBrightness(strenght);        
            led.setOn();
        }
    }

    padIntro() {
        //  1  2  3  4
        //  5  6  7  8
        //  9 10 11 12
        // 13 14 15 16

        
        if(!this.connected) return;

        this.hardware.indexed_leds['p6'].setColorByNumberHelper(6, false, true);        
        setTimeout(() => {            
            this.hardware.indexed_leds['p7'].setColorByNumberHelper(6, false, true);        
        }, 200);
        
        setTimeout(() => {            
            this.hardware.indexed_leds['p11'].setColorByNumberHelper(15, false, true);                    
        }, 400);
        
        setTimeout(() => {                        
            this.hardware.indexed_leds['p10'].setColorByNumberHelper(15, false, true);        
        }, 600);

        setTimeout(() => {
            this.hardware.indexed_leds['p1'].setWhite(); //(6, false, true);        
            this.hardware.indexed_leds['p2'].setWhite();
            this.hardware.indexed_leds['p3'].setWhite();
            this.hardware.indexed_leds['p4'].setWhite();
            this.hardware.indexed_leds['p5'].setWhite();
            //this.hardware.indexed_leds['p6'].setColorByNumberHelper(6, false, true);        
            //this.hardware.indexed_leds['p7'].setColorByNumberHelper(6, false, true);        
            this.hardware.indexed_leds['p8'].setWhite();
            this.hardware.indexed_leds['p9'].setWhite();
            //this.hardware.indexed_leds['p10'].setColorByNumberHelper(6, false, true);        
            //this.hardware.indexed_leds['p11'].setColorByNumberHelper(6, false, true);        
            this.hardware.indexed_leds['p12'].setWhite();
            this.hardware.indexed_leds['p13'].setWhite();
            this.hardware.indexed_leds['p14'].setWhite();
            this.hardware.indexed_leds['p15'].setWhite();
            this.hardware.indexed_leds['p16'].setWhite();
        }, 800);
        
        setTimeout(() => {
            this.allPadsOff();
        }, 2500);

        return;
    }

    allPadsOff() {        
        if(!this.connected) return;

        this.hardware.indexed_leds['p1'].setOff();
        this.hardware.indexed_leds['p2'].setOff();
        this.hardware.indexed_leds['p3'].setOff();
        this.hardware.indexed_leds['p4'].setOff();
        this.hardware.indexed_leds['p5'].setOff();
        this.hardware.indexed_leds['p6'].setOff();
        this.hardware.indexed_leds['p7'].setOff();
        this.hardware.indexed_leds['p8'].setOff();
        this.hardware.indexed_leds['p9'].setOff();
        this.hardware.indexed_leds['p10'].setOff();
        this.hardware.indexed_leds['p11'].setOff();
        this.hardware.indexed_leds['p12'].setOff();
        this.hardware.indexed_leds['p13'].setOff();
        this.hardware.indexed_leds['p14'].setOff();
        this.hardware.indexed_leds['p15'].setOff();
        this.hardware.indexed_leds['p16'].setOff();        
    }

    
    allLEDsOff() {
        if(!this.connected) return;

        Object.keys(this.hardware.leds).forEach(k => {
            this.hardware.setLED(k, 0);
        });
        Object.keys(this.hardware.indexed_leds).forEach(il => {            
            this.hardware.indexed_leds[il].setOff();
        });        
    }

   
    setupEvents() {        
        Object.keys(this.hardware.buttons).forEach(key => {                
            this.hardware?.on(key +':pressed', (ev?: any) => {                                
                if(ev) {
                    this.ebus.processEvent({
                        type: 'PadInput',
                        name: key+':pressed',
                        data: {
                            pressure: ev
                        }
                    });
                } else {
                    this.ebus.processEvent({
                        type: 'ButtonInput',
                        name: key+':pressed',                            
                    });
                }                
            });
            this.hardware?.on(key +':released', (ev?: any) => {                
                if(ev !== undefined && ev !== null) {
                    this.ebus.processEvent({
                        type: 'PadInput',
                        name: key+':released',
                        data: {
                            pressure: ev
                        }
                    });
                } else {
                    this.ebus.processEvent({
                        type: 'ButtonInput',
                        name: key+':released',                            
                    });
                }
            });
        });
        Object.keys(this.hardware.knobs).forEach(key => {
            this.hardware?.on(key+':changed', (v) => {                
                this.ebus.processEvent({
                    type: 'KnobInput',
                    name: key,
                    data: {...v}
                })
            });
        });
        this.hardware?.on('stepper:step', (dir) => {            
            this.ebus.processEvent({
                type: 'KnobInput',
                name: 'navStep',
                data: {
                    ...dir
                }
            })
        });
    }
}