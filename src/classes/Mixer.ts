import { GainNode } from "node-web-audio-api";
import { SoundEngine } from "./SoundEngine";

const NUM_CHANNELS = 8;

export class Mixer {

    groups: Group[] = [];
    soundEngine: SoundEngine;

    constructor(soundEngine: SoundEngine) {
        this.soundEngine = soundEngine;
        for(let i = 0; i < NUM_CHANNELS; i++) {
            this.groups.push(new Group(i, soundEngine));
        }

        console.log('set up', this.groups.length, 'groups',);
    }

}

export class Group {
    groupNode: GainNode;
    name: string;
    constructor(id: number, soundEngine: SoundEngine) {        
        this.name = `Group ${(id + 1)}`;
        this.groupNode = new GainNode(soundEngine.ctx);
        this.groupNode.connect(soundEngine.outNode);
    }
}