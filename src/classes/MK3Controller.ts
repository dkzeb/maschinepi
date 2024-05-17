import { HIDAsync } from "node-hid";
import { BUTTONS } from "./MK3AddressConsts";

import { Subject } from "rxjs";

// import { usb, findByIds, useUsbDkBackend } from "usb";
const DISPLAY_HEADER_LEFT = [0x84, 0x00, 0x00, 0x60, 0x00, 0x00, 0x00, 0x00];
const DISPLAY_HEADER_RIGHT = [0x84, 0x01, 0x00, 0x60, 0x00, 0x00, 0x00, 0x00];
const VENDORID = 6092, PRODUCTID= 5632; 

// endpoints
const inputEndpoint = 0x83, 
      outputEndpoint = 0x03,
      displayEndpoint = 0x04;

type ButtonEvent = {
    id: string;
    value: Buffer;
}

type PadEvent = {
    id: string;
    value: number; // must be parsed
}


/*var ledCheck = [ 0x80, 0x40, 0x80, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00 ];*/

class MK3Controller {

    private device?: HIDAsync;

    public buttonEvents = new Subject<ButtonEvent>();
    public padEvents = new Subject<PadEvent>();

    private constructor() {};
    
    async connect() {
        if(!!this.device) {
            await this.device.close();
        }
        this.device = await HIDAsync.open(VENDORID, PRODUCTID);
        console.log('MK3 Connected!', await (this.device as any).getDeviceInfo());

        this.device.on('data', (data: Buffer) => {            
            // we are getting input handle that
            this.handleInput(data);
        });

        // to show that we are connected lets create a little light show
        //console.log('targets', [BUTTONS.DISPLAY_BTN_1, BUTTONS.DISPLAY_BTN_3, BUTTONS.DISPLAY_BTN_5, BUTTONS.DISPLAY_BTN_7]);
        //this.setLEDs(0x80, BUTTONS.DISPLAY_BTN_2, BUTTONS.DISPLAY_BTN_4, BUTTONS.DISPLAY_BTN_6, BUTTONS.DISPLAY_BTN_8);

        let idx = 1;
        const ivHdl = setInterval(() => {
            this.setLEDs(0x80, idx);
            idx++;            
            if(idx > 62) {
                this.setLEDs(0x00); // set leds off
                clearInterval(ivHdl);
            }
        }, 100);


        
    }

    connectDisplay() {
    /*    const device = findByIds(VENDORID, PRODUCTID);
        if(!device) {
            throw new Error('NO MK3 Device found!');
        }
        device.open();
        
        console.log('Display Interface', device.interface(5));
        
        const tx = device.interface(5).endpoint(0x03)?.makeTransfer(0, (err, b, length) => {
            if(err) { console.error(err) }
            console.log('b', b. length);
        });
        useUsbDkBackend();        
        const displayBuffer = Buffer.from([
            ...DISPLAY_HEADER_LEFT,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        ])
        tx?.submit(displayBuffer);
**/
        //console.log('MK3', device.allConfigDescriptors);
    }

    private static _instance: MK3Controller;
    public static get instance(): MK3Controller {        
        if(!this._instance) {
            this._instance = new MK3Controller();        
        }
        return this._instance;
    }

    handleInput(inputData: Buffer) {
        // start by parsing the input type 
        // check the first byte, if it is 1 it's a button or knob
        // if it is 2 it's a pad

        if(inputData[0] === 1) {
            console.log('button/knob');
            this.handleButtonInput(inputData);
        } else if(inputData[0] === 2) {
            console.log('handlePadInput');
            this.handlePadInput(inputData);
        }
    }

    handlePadInput(inputData: Buffer) {
        this.padEvents.next({
            id: 'test',
            value: 22
        });
    }
    handleButtonInput(inputData: Buffer) {
        this.buttonEvents.next({
            id: 'testBtn',
            value: inputData
        });
    }
    
    setLEDs(value: number, ...targets: number[]) {
        const arr = Array.from({
            length: 62
        }, () => 0x00);
        arr[0] = BUTTONS.ADDR;
        targets.forEach(idx => {
            arr[idx] = value;
        });

        this.device?.write(arr);
        //return arr;

    }
}

export default MK3Controller.instance;
