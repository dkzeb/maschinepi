import { container } from "tsyringe";
import { Group } from "./Mixer";
import { SoundEngine } from "./SoundEngine";
import { GainNode } from "node-web-audio-api";

export class Pad {
    color: string;
    pIdx: string;
    selected: boolean;
    gainNode: GainNode;
    group: Group;
    sampleName?: string;
    soundEngine: SoundEngine;

    constructor(color: string, pIdx: string, selected: boolean, group: Group) {
        this.color = color;
        this.pIdx = pIdx;
        this.selected = selected;
        this.group = group;
        this.soundEngine = container.resolve(SoundEngine);
        this.gainNode = new GainNode(this.soundEngine.ctx);
        this.gainNode.connect(this.group.groupNode);
    }

    loadSample(name:string){
        this.sampleName = name;
    }

    play() {
        if(!this.sampleName) {
            return;
        }
        const sampleSource = this.soundEngine.ctx.createBufferSource();
        const sample = this.soundEngine.sources[this.sampleName];
        sampleSource.buffer = sample;
        sampleSource.connect(this.gainNode);
        sampleSource.onended = () => sampleSource.disconnect();
        sampleSource.start();
    }
}