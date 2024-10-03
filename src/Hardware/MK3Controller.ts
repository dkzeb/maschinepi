import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import * as jpeg from 'jpeg-js';
import { UIController } from "../UI/UIController";
import { container, injectable, singleton } from "tsyringe";
import * as path from 'path';
import * as fs from 'fs';
import { Display, DisplayType } from "../UI/display";

export enum DisplayTarget {
    "left",
    "right",
    "main"
}

export class HardwareDisplay extends Display {    
    
    constructor(name: string) {
        super({
            name,
            width: 480,
            height: 272,
            type: DisplayType.MK3Display
        });
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
        const logoPath = path.join(process.cwd(), 'assets', 'images', 'maschinepi-splash.jpg');
        const logo = fs.readFileSync(logoPath);
        if(logo) {            
            this.sendImage(logo, DisplayTarget.left);
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
    }

    async init() {        
        if(this.hardware.displays) {
            // create the two display instances
            this.displays.left = new HardwareDisplay("MK3Left");
            this.displays.right = new HardwareDisplay("MK3Right");
            this.UI.registerDisplay(this.displays.left);
            this.UI.registerDisplay(this.displays.right);
            console.log('created hardware screens');
        }
    }

    sendImage(imgData: Buffer, display: DisplayTarget, skipParse?: boolean)
    sendImage(imgData: Uint8Array, display: DisplayTarget)    
    sendImage(imgData: Uint8Array | Buffer, display: DisplayTarget, skipParse = false) {
        if(Buffer.isBuffer(imgData) && !skipParse) {
            const decoded = jpeg.decode(imgData, { useTArray: true, formatAsRGBA: false });
            imgData = decoded.data;
        }        
        
        const displayKey = DisplayTarget.left ? 'MK3Left' : 'MK3Right';
        const UIDisplay = [...this.UI.displays].find(d => d.options.name === displayKey.replace("MK3", "").toLowerCase());
        if(UIDisplay) {
            this.hardware.displays!.paintDisplay(display, imgData, UIDisplay.displayBuffer);
        }
    }    
}