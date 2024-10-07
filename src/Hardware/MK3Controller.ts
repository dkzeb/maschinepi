import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import * as jpeg from 'jpeg-js';
import { UIController } from "../UI/UIController";
import { container, injectable, singleton } from "tsyringe";
import * as path from 'path';
import * as fs from 'fs';
import { Display, DisplayType } from "../UI/display";

export enum DisplayTarget {
    Left,
    Right,
    Main
}

export class HardwareDisplay extends Display {    
    
    buffer: ArrayBuffer;    
    private paintDisplay?: (displayNum: number, rgbData: Uint8Array, buf?: ArrayBuffer) => void;

    constructor(name: string, displayTarget: DisplayTarget, controller: MaschineMk3) {
        super({
            name,
            width: 480,
            height: 272,
            type: DisplayType.MK3Display,
            displayTarget
        });        
        this.buffer = controller.displays!.createDisplayBuffer();
        this.paintDisplay = controller.displays!.paintDisplay;
    }

    override async draw(): Promise<void> {
        if(this.paintDisplay) {
            super.draw();
            
            // draw the actual image to the display
    
            //const display 
            const imgData = await this.cvs.toBuffer();    
            console.log('hwdrawdbg:', this.options.displayTarget, imgData, this.buffer);
            this.paintDisplay(this.options.displayTarget, imgData, this.buffer);
        }
    }    

    sendText(...args: any[]) {
        console.info("Writing text", [...args]);    
    }

    sendImage(ctrl: MK3Controller, imgData: Buffer, display: DisplayTarget, skipParse?: boolean)
    sendImage(ctrl: MK3Controller, imgData: Uint8Array, display: DisplayTarget)    
    sendImage(ctrl: MK3Controller, imgData: Uint8Array | Buffer, display: DisplayTarget, skipParse = false) {
        if(Buffer.isBuffer(imgData) && !skipParse) {
            const decoded = jpeg.decode(imgData, { useTArray: true, formatAsRGBA: false });
            imgData = decoded.data;
            ctrl.sendImage(imgData as Buffer, display, skipParse);
        }
    }
}

@singleton()
@injectable()
export class MK3Controller {

    showBootscreen() {
        const logoPath = path.join(process.cwd(), 'data', 'images', 'maschinepi-splash.jpg');
        const logo = fs.readFileSync(logoPath);
        if(logo) {            
            this.sendImage(logo, DisplayTarget.Left);
        }
    }

    hardware: MaschineMk3;
    UI: UIController = container.resolve(UIController);
    displays: {
        left?: Display | HardwareDisplay,
        right?: Display | HardwareDisplay,
    } = {};

    constructor() {
        //super();
        this.hardware = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);        
        this.init();
    }

    async init() {        
        await this.hardware.init();        
        if(this.hardware.displays) {
            // create the two display instances
            this.displays.left = new HardwareDisplay("MK3Left", DisplayTarget.Left, this.hardware);
            this.displays.right = new HardwareDisplay("MK3Right", DisplayTarget.Right, this.hardware);
            this.UI.registerDisplay(this.displays.left);
            this.UI.registerDisplay(this.displays.right);
            console.log('Created MK3 Displays');
        }
    }

    sendImage(imgData: Buffer, display: DisplayTarget, skipParse?: boolean)
    sendImage(imgData: Uint8Array, display: DisplayTarget)    
    sendImage(imgData: Uint8Array | Buffer, display: DisplayTarget, skipParse = false) {

        console.log('Sending image to HW', display);

        if(Buffer.isBuffer(imgData) && !skipParse) {
            const decoded = jpeg.decode(imgData, { useTArray: true, formatAsRGBA: false });
            imgData = decoded.data;
        }        
        
        const displayKey = DisplayTarget.Left ? 'MK3Left' : 'MK3Right';
        const UIDisplay = [...this.UI.displays].find(d => d.options.name === displayKey.replace("MK3", "").toLowerCase());
        if(UIDisplay) {
            this.hardware.displays!.paintDisplay(display, imgData, UIDisplay.displayBuffer);
        }
    }    
}