import { Sample } from "@prisma/client";
import { EventBus } from "../../EventBus";
import { SoundEngine } from "../../SoundEngine";
import { UIController } from "../UIController";
import { Widget, WidgetConfig, WidgetOption } from "./widget";
import { container } from "tsyringe";

export class SampleDisplay extends Widget {    
    name = 'SampleDisplay';
    soundEngine: SoundEngine;
    data: { sample?: Sample, preview?: boolean } = {};
    didAddSource: boolean = false;    
    options: WidgetOption[] = [
        {
            label: 'Preview',
            button: 'd7',
            action: (action) => {                
                if(action) {
                    this.playPreview();
                }                
            }
        },
        {
            label: 'Load Sample',
            button: 'd8',
            action: (action) => {                
                if(action) {                    
                    this.ebus.processEvent({
                        type: 'WidgetResult',
                        data: {
                            sample: this.data.sample
                        }
                    });
                }
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

    setup() {}
    
    async draw() {
      
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
            await this.soundEngine.drawAudioBuffer(this.ctx, this.data.sample.data, 190, 480, 0, 65);
        }
      
    }
}