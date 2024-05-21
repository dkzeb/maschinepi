import { QPushButton } from "@nodegui/nodegui";
import { Sample } from "@prisma/client";
import eventBus from "./eventBus";
import SoundEngine from "./webaudioSE";

export class Pad extends QPushButton {
    sample?: Sample;
    name?: string;
    constructor(name: string) {
        super();
        this.addEventListener('clicked', () => this.handleClick());
        this.name = name;
        this.setObjectName(name);
    }

    loadSample(sample: Sample) {
        this.sample = sample;
        this.setText(this.sample.name);
        SoundEngine.addSource(sample.name, sample.data);
    }

    
    handleClick() {        
        eventBus.events$.next({
            id: this.objectName()
        });        
        this.playSample();
    }

    playSample() {
        if(this.sample) {
            SoundEngine.play(this.sample.name);
        }
    }
}