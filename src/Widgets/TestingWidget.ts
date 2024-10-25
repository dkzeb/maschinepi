import { container } from "tsyringe";
import { Pad, UITools } from "../UI/UITools";
import { Widget } from "./Widget";
import { EventBus } from "../Core/EventBus";

import { debounceTime, filter } from "rxjs";
import { Instrument } from "../AudioEngine/instrument";
import SimpleOscillator from "./SimpleOscillator";
import { DisplayTarget, MK3Controller } from "../Hardware/MK3Controller";
import { UIController } from "../UI/UIController";

const noteFreqScales = {
    "C":   [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00, 4186.01],
   "Db":   [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
    "D":   [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
   "Eb":   [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
    "E":   [20.60, 41.20, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    "F":   [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
   "Gb":   [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
    "G":   [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
   "Ab":   [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
    "A":   [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
   "Bb":   [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    "B":   [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
 }; 

 const noteIndexes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export class TestingWidget extends Widget<TestingWidget> {

    
    ebus: EventBus = container.resolve(EventBus)
    UI: UIController = container.resolve(UIController);
    mk3: MK3Controller = container.resolve(MK3Controller);
    instruments: Instrument[] = [];

    noteOctave = 4;

    osc: SimpleOscillator;

    pads: Pad[] = [];
    
    constructor() {
        super({
            discriminator: 'TestingWidget'
        });

        for(let x = 1; x <= 16; x++) {
            this.pads.push({
                name: 'p' + x,
                active: false
            });
        }

        console.log('Pads', this.pads);        
        this.osc = new SimpleOscillator();
    }

    activate(): void {
        this.osc.initOsc();
        this.widgetSubscriptions.push(this.ebus.events.pipe(filter(ev => ev.type === 'PadInput')).subscribe(async ev => {
            console.log('Testing got padinput', ev);             

            // 0 is pad id, 1 is pad state
            const padStruct = ev.name?.split(':');
            const p = this.pads.find(pad => pad.name === padStruct![0]);
            if(p) {
                if(padStruct![1] === 'pressed') {                
                    p.active = true;

                    if(!this.osc.isStarted) {
                        this.osc.start();
                    }                    
                    
                    // get frequency
                    const pIdx = parseInt(p.name.replace('p', '')) - 1;
                    const note = noteIndexes[pIdx % 11];
                    console.log('pIdx / Note', pIdx, note);
                    const freq = noteFreqScales[note][this.noteOctave];
                    console.log('Note is', note, freq);

                    this.osc.setFrequency(freq);

                    this.osc.setChannelVolume(1);                    

                    this.mk3.hardware.indexed_leds[padStruct![0]].setWhite();

                } else {
                    p.active = false;                    
                    this.mk3.hardware.indexed_leds[padStruct![0]].setOff();

                    const otherActives = this.pads.filter(pad => pad.active).length > 0;
                    if(!otherActives)
                        this.osc.setChannelVolume(0);
                }
                const data = await this.render();
                this.UI.sendImage(data, this.targetDisplay === 'left' ? DisplayTarget.Left : DisplayTarget.Right);                
            }
        }));

        this.mk3.setLED("keyboard", 1000);
    }

    override deactivate(): void {
        super.deactivate();
        this.mk3.allLEDsOff();
        this.mk3.allPadsOff();
        if(this.osc.isStarted) {
            this.osc.stop();
        }
    }

    async render(update?: boolean): Promise<string> {        
        console.log('starting render', performance.now());
        if(!this.ctx) {
            if(!this.canvas) {
                throw new Error("Testing Widget has no canvas!");
            }
            this.ctx = this.canvas.getContext("2d");            
        }
        
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        UITools.DrawPads(this.ctx, { pads: this.pads });    
        console.log('stop render', performance.now());
        return this.canvas!.toDataURL();
    }    
}