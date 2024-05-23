import { EventBus } from "./EventBus";
import { SoundEngine } from './SoundEngine';
import { filter } from "rxjs";

export class AudioController {
    soundEngine: SoundEngine;
    ebus: EventBus;
    constructor(ebus: EventBus, soundEngine: SoundEngine) {
        this.ebus = ebus;
        this.soundEngine = soundEngine;
        this.ebus.events.pipe(
            filter((ev => {
                return ev.type === 'PadInput'
            }))    
        ).subscribe((ev => {
            if(ev.data) {
                this.soundEngine.play(ev.data.sampleName);
            }
        }));
    }

    
}