import * as fs from 'fs';
import { container, injectable, singleton } from "tsyringe";
import { EventBus, MPIEvent } from "../Core/EventBus";
import { DisplayTarget } from "../Hardware/MK3Controller";
import { Display, TextOptions } from "./display";
import { DevDisplay } from './devDisplay';
import { Widget } from '../Widgets/Widget';
import { registerFont } from 'canvas';

process.env.PANGOCAIRO_BACKEND = 'fontconfig';
// register graphik font
registerFont(require('@canvas-fonts/impact'), { family: "Impact" });        

// FPS   
const fps = 12;

export type UICommand = MPIEvent & {
    target: DisplayTarget
}

@singleton()
@injectable()
export class UIController {
    eventbus: EventBus = container.resolve(EventBus);
    displays: Set<Display> = new Set<Display>();        
    widgets: Set<Widget<unknown>> = new Set<Widget<unknown>>();            

    private activeDisplays(target: DisplayTarget): Display[] 
    {        
        const activeDisplays = [...this.displays].filter(d => {                     
            return d.displayTarget === target;
        });                
        return activeDisplays;
    }

    registerDisplay(display: Display) {
        // clear out display     
        display.clear();
        this.displays.add(display);   
    }

    registerWidget(widget: Widget<unknown>) {
        console.info('Registering Widget', widget.discriminator);
        this.widgets.add(widget);
    }
    
    updateSide(target: DisplayTarget) {
        this.displays.forEach(d => {
            if(d.displayTarget === target) {
                d.draw();
            }
        });
    }

    sendImage(fileData: any, target: DisplayTarget) {             
        const displays = this.activeDisplays(target);        
        displays.forEach(d => {                        
            d.sendImage(fileData);
        })
    }

    async sendWidget(widgetEvent: {
        widgetName: string,
        targetDisplay: DisplayTarget        
    }) {        
        const widget = [...this.widgets].find(w => w.discriminator === widgetEvent.widgetName);
        if(!widget) {
            console.error("NO WIDGET ", widgetEvent.widgetName);
            throw new Error("NO_WIDGET_WITH_DISCRIMINATOR");
        }

        const widgetImgData = await widget.renderWidget();                
        const displays = this.activeDisplays(widgetEvent.targetDisplay);            
        for(let d of displays) {            
            d.sendImage(widgetImgData)
        }        
    }

    sendText(textOptions: TextOptions, target: DisplayTarget) {
        const displays = this.activeDisplays(target);             
        displays.forEach(d => {            
            d.sendText(textOptions);
        });
    }

    constructor() {                                                       
        this.eventbus.events.subscribe((ev) => {
            if(ev.type === 'UIEvent') {         
                
                if(ev.data.type === 'openWidget') {                                        
                    this.sendWidget(ev.data);
                }

                if(ev.data.type === 'text') {                    
                    const data = ev.data as TextOptions;                    
                    this.sendText(data, ev.data.targetDisplay)
                    return;
                }
                
                if(ev.data.type === 'image') {                    
                    const fileData = fs.readFileSync(ev.data.path);                    
                    this.sendImage(fileData, ev.data.targetDisplay);                    
                    return;
                }
                                
                if(ev.data.side) {
                    this.updateSide(ev.data.side);                
                }
            }
        });
    }

    createDevDisplays(): void {
        // create dev display
        this.registerDisplay(new DevDisplay("DevLeft", DisplayTarget.Left, "DEV1.txt"));
        this.registerDisplay(new DevDisplay("DevRight", DisplayTarget.Right, "DEV2.txt"));        
        console.info("Created Dev Displays");
    }

}