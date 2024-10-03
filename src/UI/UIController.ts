import * as fs from 'fs';
import { container, injectable, singleton } from "tsyringe";
import { EventBus, MPIEvent } from "../Core/EventBus";
import { DisplayTarget } from "../Hardware/MK3Controller";
import { Display, TextOptions } from "./display";
import { DevDisplay } from './devDisplay';


// FPS   
const fps = 12;
const timeoutMS = 1000 / fps;

export type UICommand = MPIEvent & {
    target: DisplayTarget
}
//type UIHardwareController<T = HardwareController> = T & HardwareController;

@singleton()
@injectable()
export class UIController {
    eventbus: EventBus = container.resolve(EventBus);
    displays: Set<Display> = new Set<Display>();        

    private activeDisplays(target: DisplayTarget): Display[] 
    {
        const activeDisplays = [...this.displays].filter(d => {            
            const key = target === DisplayTarget.left ? 'left' : 'right';
            return d.options.name.toLocaleLowerCase().indexOf(key) > -1;
        });
        return activeDisplays;
    }

    registerDisplay(display: Display) {
        // clear out display     
        display.clear();
        this.displays.add(display);   
    }

    updateDisplays(): void {
        this.displays.forEach(d => {            
            d.draw();
        });
    }

    updateSide(side: 'left' | 'right') {
        this.displays.forEach(d => {
            if(d.options.name.toLowerCase().indexOf(side) > -1) {
                d.draw();
            }
        });
    }

    sendImage(fileData: any, target: DisplayTarget) {        
        
        this.activeDisplays(target).forEach(d => {            
            d.sendImage(fileData);
        })
    }

    sendText(textOptions: TextOptions, target: DisplayTarget) {
        this.activeDisplays(target).forEach(d => {            
            d.sendText(textOptions);
        });
    }


    constructor() {                                        
        this.eventbus.events.subscribe((ev) => {
            if(ev.type === 'UIEvent') {                       
                if(ev.data.type === 'text') {
                    const data = ev.data as TextOptions;                    
                    this.sendText(data, ev.data.side === 'left' ? DisplayTarget.left : DisplayTarget.right)
                    return;
                }
                
                if(ev.data.type === 'image') {
                    //console.log('handle the event', ev.data);
                    const fileData = fs.readFileSync(ev.data.path);
                    this.sendImage(fileData, ev.data.side === 'left' ? DisplayTarget.left : DisplayTarget.right);                    
                    return;
                }
                                
                if(ev.data.side) {
                    this.updateSide(ev.data.side);                
                } else {
                    this.updateDisplays();
                }                                
            }
        });
    }

    createDevDisplays(): void {
        // create dev display
        this.registerDisplay(new DevDisplay("DevLeft", "DEV1.txt"));
        this.registerDisplay(new DevDisplay("DevRight", "DEV2.txt"));
        console.log('created dev displays');
        const totalDisplays = [...this.displays].map(d => d.options.name);
    }

}