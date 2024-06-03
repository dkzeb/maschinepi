//import { AudioIO, SampleFormat16Bit, IoStreamWrite, getDevices, SampleFormat24Bit, SampleFormatFloat32 } from "naudiodon2";

import { AudioBuffer, AudioContext, GainNode } from 'node-web-audio-api';
import { CanvasRenderingContext2D } from 'canvas';

export class SoundEngine {

    ctx: AudioContext = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
    sources: Record<string, AudioBuffer> = {};
    outNode: GainNode; // = new GainNode(this.ctx);    

    constructor() {        
        this.sources = {};
        this.outNode = new GainNode(this.ctx);
        this.outNode.connect(this.ctx.destination);
    }
    
    async addSource(name: string, data: Buffer) {        
        if(this.sources[name]) {
            throw new Error("Source already exists!");
        } else {            
            this.sources[name] = await this.ctx.decodeAudioData(data.buffer);
        }
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
        smplSource.onended = () => smplSource.disconnect();
        smplSource.start();
    }

    async drawAudioBuffer(canvas2d: CanvasRenderingContext2D, buffer: Buffer, height: number, width: number, x = 0, y = 0, color?: string) {
        let origColor;
        if(color) {
            origColor = canvas2d.fillStyle;
            canvas2d.fillStyle = color;
        }
        const audioBuffer = await this.ctx.decodeAudioData(buffer.buffer);
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;
        for(let i = 0; i < width; i++) {
            let min = 1.0, max = -1.0;
            for(let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if(datum < min) {
                    min = datum;
                }
                if(datum > max) {
                    max = datum;
                }
                canvas2d.fillRect(x + i, y + ((1+min)*amp),1, Math.max(1, (max-min)*amp));
            }
        }
        if(color) {
            canvas2d.fillStyle = origColor; 
        }
    }
}
