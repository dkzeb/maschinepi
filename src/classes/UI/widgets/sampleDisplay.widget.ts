import { Sample } from "@prisma/client";
import { EventBus } from "src/classes/EventBus";
import { SoundEngine } from "src/classes/SoundEngine";
import { UIController } from "../UIController";
import { Widget, WidgetConfig, WidgetOption } from "./widget";
import { container } from "tsyringe";

export class SampleDisplay extends Widget {    
    name = 'SampleDisplay';
    soundEngine: SoundEngine;
    data: { sample?: Sample, preview?: boolean } = {};
    didAddSource: boolean = false;
    drawCB?: () => void;
    options: WidgetOption[] = [
        {
            label: 'Preview',
            button: 'd7',
            action: () => this.playPreview()
        },
        {
            label: 'Load Sample',
            button: 'd8',
            action: () => {
                //this.resolve
            }
        }
    ]
    eventBus: EventBus;
    
    constructor(config: WidgetConfig) {
        super(config);
        this.soundEngine = container.resolve(SoundEngine);        
        this.eventBus = container.resolve(EventBus);      
    }    

    playPreview() {
        if(this.data && this.data.sample)
            this.soundEngine.play(this.data.sample.name);
    }

    result() {
        console.log('we have a result');
    }

    async draw(cb?: (() => void) | undefined) {

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }        
        if(!this.data.sample) {
            return;
        } else {            
            if(this.data.preview) {                
                this.playPreview();
            }
            
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0,0,this.width,this.height);
            this.ctx.fillStyle = 'white';
            
            this.title = this.data.sample.name;
            this.drawMenu();
            this.drawTitleBar();

            // hookup the options buttons
            this.mk3Controller.mk3.setLED('d7', 10000);            
            this.mk3Controller.mk3.setLED('d8', 10000);

            await this.soundEngine.drawAudioBuffer(this.ctx, this.data.sample.data, 190, 480, 0, 65);
        }

        if(this.drawCB) {
            this.drawCB()
        }        
    }
}