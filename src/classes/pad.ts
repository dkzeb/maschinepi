import { QPushButton } from "@nodegui/nodegui";
import { Sample } from "@prisma/client";
import eventBus from "./eventBus";
import soundEngine from "./soundEngine";

export class Pad extends QPushButton {
    sample?: Sample;
    constructor(name: string) {
        super();
        this.addEventListener('clicked', () => this.handleClick());
        this.setObjectName(name);
    }

    loadSample(sample: Sample) {
        this.sample = sample;
        this.setText(this.sample.name);
    }

    
    handleClick() {
        console.log('clicked me');
        eventBus.events$.next({
            id: this.objectName()
        });
        console.log('eventBus', eventBus.events$);
        this.playSample();
    }

    playSample() {
        if(this.sample) {
            soundEngine.playSound(this.sample.data);
        }
    }
}