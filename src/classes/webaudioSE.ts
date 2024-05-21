//import { AudioIO, SampleFormat16Bit, IoStreamWrite, getDevices, SampleFormat24Bit, SampleFormatFloat32 } from "naudiodon2";

import { AudioContext, GainNode, AudioBuffer } from 'node-web-audio-api';
import { PadOutput } from './mixer';

class SoundEngineWeb {

    ctx: AudioContext = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
    sources: Record<string, AudioBuffer> = {};
    outNode: GainNode; // = new GainNode(this.ctx);    

    private static _instance: SoundEngineWeb;
    public static get instance(): SoundEngineWeb
    {
        if(!this._instance) {
            this._instance = new SoundEngineWeb();
        }

        return this._instance;
    }

    private constructor() {        
        this.sources = {};
        this.outNode = new GainNode(this.ctx);
        this.outNode.connect(this.ctx.destination);
    }
    
    async addSource(name: string, data: Buffer) {
        console.log('adding source', this.sources);        
        if(this.sources[name]) {
            throw new Error("Source already exists!");
        } else {            
            this.sources[name] = await this.ctx.decodeAudioData(data.buffer);
        }
        console.log('added source', name, this.sources[name].length);
    }

    async playSamples(sampleNames: string[]) {
        const buffers: AudioBufferSourceNode[] = [];        
        sampleNames.forEach(sn => {
            const output = this.ctx.createBufferSource();
            output.buffer = this.sources[sn];
            output.connect(this.outNode);
            output.onended = () => output.disconnect();
            buffers.push(output);
        });
        buffers.forEach(output => output.start());
    
    }
    
    async play(name: string) {
        if(!this.sources[name]) {
            console.log('sources', this.sources);
            throw new Error("No source found with name: " + name);
        }
        const smpl = this.sources[name];
        const smplSource = this.ctx.createBufferSource();
        smplSource.buffer = smpl;
        smplSource.connect(this.outNode);
        smplSource.start();
    }
}

export default SoundEngineWeb.instance;