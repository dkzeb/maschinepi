import { Application, Container, DisplayObject, Graphics, Text } from '@pixi/node';
import * as fs from 'fs';
import * as jpeg from 'jpeg-js';
import { MK3Controller } from '../Hardware/MK3Controller';
import { container, singleton } from 'tsyringe';
import { UITools } from './UITools';
import { StateController } from '../Core/StateController';


@singleton()
export class PIXIUIController {

    app: Application;
    mk3: MK3Controller = container.resolve(MK3Controller);
    private containers: Record<string, Container>;
    private displayBuffers: Record<string, ArrayBuffer>;

    get main() {
        return {
            container: this.containers.main,
            buffer: this.displayBuffers.main
        }
    }

    get left() {
        return {
            container: this.containers.left,
            buffer: this.displayBuffers.left
        }
    }

    get right() {
        return {
            container: this.containers.right,
            buffer: this.displayBuffers.right
        }
    }
    
    /*conversionWorker = new Worker('./src/UI/worker.js', {
        workerData: {
            path: './conversionWorker.ts'
        }
    });*/
    shouldUpdate = false;
    
    set nextUI(uiJson: UIJson) {
        console.log('updating nextUI');
        this._nextUI = uiJson;
        this.app.ticker.addOnce(() => {                                                
            console.log('updating');
            this.drawUI(this._nextUI ?? { target: 'left', controls: []});                                
        });            
    }
    private _nextUI?: UIJson;

    constructor() {        
       this.app = new Application({
        width: 480*2,
        height: 480 + 272
       });


       this.app.ticker.maxFPS = 30;
       
       this.containers = {
        main: new Container(),
        left: new Container(),
        right: new Container()
       }

       this.displayBuffers = {
        main: this.mk3.hardware.displays!.createDisplayBuffer(),
        left: this.mk3.hardware.displays!.createDisplayBuffer(),
        right: this.mk3.hardware.displays!.createDisplayBuffer(),
       }

       this.main.container.x = 0;
       this.main.container.y = 0;

       this.left.container.x = 0;
       this.left.container.y = 480;

       this.right.container.x = 480;
       this.right.container.y = 480;
       
       for(let c in this.containers) {        
        this.app.stage.addChild(this.containers[c]);
       }                                 

       
       if(this.mk3.connected) {
           for(let i = 0; i < 2; i++) {
               this.mk3.hardware.displays!.paintDisplay(i, Uint8Array.from([0]), this.left.buffer);
            }
        }
        
        this.render();
    }    

    drawUI(elms: UIJson) {
        const target = this.containers[elms.target];
        elms.controls.forEach(ctrl => {

            switch(ctrl.type) {
                case 'text': 
                break;
                case 'option':
                break;
                case 'menu':
                default:
                    console.warn('Unrecognized type', ctrl.type);
                    break;
            }

            if(ctrl.type === 'text' && ctrl.label) {
                const ctrlText = new Text(ctrl.label, { fill: '#ffffff' });
                ctrlText.position.set(ctrl.dims?.x ?? 0, ctrl.dims?.y ?? 0);
                target.addChild(ctrlText);
            }
        });

        if(elms.controls.length > 0) {
            this.render();        
        }
    }

    render(target?: TargetDisplay) {                
        this.app.ticker.addOnce(() => {
            this.app.render();
            const pixels = this.app.renderer.extract.pixels();                            
            this.renderDisplays(pixels as Uint8Array);        
        })
    }

    renderDisplayObject(target: TargetDisplay, dispObj: DisplayObject) {        
        const cnt = this.containers[target];
        cnt.removeChildren();
        cnt.addChild(dispObj);
        this.render();
    }

    private renderDisplays(pixels: Uint8Array, displays: string[] = ['left', 'right', 'main']) {
        displays.forEach(displayName => {
            const dims = displayName === 'main' ? { x: 0, y: 0, w: 800, h: 480 } : { x: displayName === 'left' ? 0 : 480, y: 480, w: 480, h: 272 };
            const displayRegion = UITools.ExtractRegion(dims.x, dims.y, dims.w, dims.h, pixels, 480 * 2, true);                        
            this.renderHardwareDisplays(displayName, UITools.convertToRGB(displayRegion, dims.w, dims.h));            
            this.renderDevDisplays(displayName, dims, displayRegion);    
        });        

    }

    private async renderHardwareDisplays(name: string, imageData: Uint8Array) {

        if(name === 'main') {
            // skip, TODO: Implement main display when hardware is ready            
        } else {
            if(this.mk3.connected) {
                await this.mk3.hardware.displays?.paintDisplay(
                    name === 'left' ? 0 : 1,
                    imageData,
                    this.displayBuffers[name]
                );
            }
        }

    }

    private renderDevDisplays(name: string, dims, reg) {        
        // TODO: Fix once devdisplays extension is working correctly again
        return;
        try {
                const encoded = jpeg.encode({
                    data: reg,
                    width: dims.w,
                    height: dims.h,
                }, 10);                
                fs.writeFileSync('./.maschinepi/devdisplays/jpegs/' + name + '.jpg', encoded.data);
            } catch (e: any) {
                if(e.message.indexOf('EBUSY')) {
                    console.warn('DevDisplays dropped a frame on', name);
                } else {
                    throw e;
                }
            }
            
        }

}

export type Dims = {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type TargetDisplay = 'main' | 'left' | 'right';

export type UIComponent = {
    dims?: Partial<Dims>;
    type: 'option' | 'text' | 'menu',
    label?: string
}

export type UIJson = {
    target: 'left' | 'right' | 'main';
    options?: UIOption[],
    knobs?: UIKnob[],
    controls: UIComponent[]
}
 
export type UIOption = {        
    label: string,
    slot: number,
    active?: boolean
};

export type UIKnob = {        
    label: string,
    slot: number,
    value: number,
    active?: boolean    
};

export type UIPad = {
    padIndex: number;
    padName: string;
    color?: string;
    active?: boolean;
}
