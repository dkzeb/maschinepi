import { Application, Container, DisplayObject, Graphics, Text } from '@pixi/node';
import * as fs from 'fs';
import * as jpeg from 'jpeg-js';
import { MK3Controller } from '../Hardware/MK3Controller';
import { container, singleton } from 'tsyringe';
import { UITools } from './UITools';
import { PixiWidget } from 'src/Widgets/pixi/PixiWidget';
import { ModalWidget } from 'src/Widgets/pixi/ModalWidget';


@singleton()
export class PIXIUIController {

    app: Application;
    mk3: MK3Controller = container.resolve(MK3Controller);
    widgetMgr: WidgetManager = container.resolve(WidgetManager);
    private containers: Record<string, Container>;
    private displayBuffers: Record<string, ArrayBuffer>;                    

    private modalContainer = new Container();

    deltaTime: number = 0;

    constructor() {        
       this.app = new Application({
        width: 480*2,
        height: 480 + 272
       });


       this.app.ticker.maxFPS = 20;
       /*this.app.renderer.on('prerender', (arg) => {
        console.log
       });*/

       this.app.renderer.on('postrender', () => {
        this.deltaTime += this.app.ticker.deltaMS;
            if(this.deltaTime > 1000 / 20) {
                this.renderDisplays(this.app.renderer.extract.pixels() as Uint8Array);
                this.deltaTime = 0;
            }
       });
       
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

       this.containers.main.x = 0;
       this.containers.main.y = 0;

       this.containers.left.x = 0;
       this.containers.left.y = 485;

       this.containers.right.x = 485;
       this.containers.right.y = 485;
       
       for(let c in this.containers) {        
        this.app.stage.addChild(this.containers[c]);
       }                            
           

       this.modalContainer.zIndex = 100;
       this.app.stage.addChild(this.modalContainer);

       if(this.mk3.connected) {
            for(let i = 0; i < 2; i++) {
                this.mk3.hardware.displays!.paintDisplay(i, Uint8Array.from([0]), this.displayBuffers.left);
            }
        }        
    }    

    private renderDisplays(pixels: Uint8Array, displays: TargetDisplay[] = ['left', 'right', 'main']) {
        displays.forEach(displayName => {
            const dims = displayName === 'main' ? { x: 0, y: 0, w: 800, h: 480 } : { x: displayName === 'left' ? 0 : 480, y: 485, w: 480, h: 272 };
            const displayRegion = UITools.ExtractRegion(dims.x, dims.y, dims.w, dims.h, pixels, 480 * 2, true);                        
            this.renderHardwareDisplays(displayName, UITools.convertToRGB(displayRegion, dims.w, dims.h));            
            //this.renderDevDisplays(displayName, dims, displayRegion);
        });        

    }

    widgets: ModalWidget<unknown>[] =  [];

    addModal(w: ModalWidget<unknown>) {    
        //this.widgets.push(w);
        this.modalContainer.addChild(w.draw());
    }

    addWidget(w: PixiWidget, target: TargetDisplay) {    
        const c = this.getDisplay(target);
        c.container.removeChildren();
        c.container.addChild(w.draw());
        this.widgetMgr.addWidget(w);
    }

    removeWidget(w: ModalWidget<unknown>) {
        this.widgetMgr.removeWidget(w.opts.name);
    }

    getDisplay(id: TargetDisplay) {
        return {
            container: this.containers[id],
            buffer: this.displayBuffers[id]
        }
    }

    isRenderingLeft = false;
    isRenderingRight = false;

    private async renderHardwareDisplays(name: string, imageData: Uint8Array) {

        if(name === 'main') {
            // skip, TODO: Implement main display when hardware is ready            
        } else {
            if(this.mk3.connected) {                

                // to avoid flickering on displays, we track if we are currently painting the target display

                if(name === 'left') {
                    if(!this.isRenderingLeft) {
                        this.isRenderingLeft = true;
                        await this.mk3.hardware.displays?.paintDisplay(0, imageData, this.displayBuffers.left)
                        this.isRenderingLeft = false;
                    }
                } else {
                    if(!this.isRenderingRight) {
                        this.isRenderingRight = true;
                        await this.mk3.hardware.displays?.paintDisplay(1, imageData, this.displayBuffers.right)
                        this.isRenderingRight = false;
                    }
                }                
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

@singleton()
export class WidgetManager {
    widgets: Map<string, PixiWidget> = new Map();

    addWidget(widget: PixiWidget) {
        this.widgets.set(widget.opts.name, widget);
    }

    removeWidget(widgetName: string) {
        const w = this.widgets.get(widgetName);
        if(w) {
            w.teardown().then(() => {
                console.log('teardown complete');
                this.hideWidget(w.opts.name);
                w.uiCtrl.app.ticker.addOnce(() => {
                    this.widgets.delete(w.opts.name);
                    console.log('succesfully removed', widgetName);
                });
            });
                                    
        }
    }

    showWidget(widgetName: string) {        
        const w = this.widgets.get(widgetName);
        if(w && w.widgetUi) {
            w.widgetUi.renderable = true;
        }
    }

    hideWidget(widgetName: string) {
        const w = this.widgets.get(widgetName);
        if(w && w.widgetUi) {
            console.log('hid widget', widgetName);
            w.widgetUi.renderable = false;
        } else {
            console.log('error, cant hide', widgetName, w?.widgetUi);
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
    active?: boolean,
    activeColor?: string,
    toggleable?: boolean
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
