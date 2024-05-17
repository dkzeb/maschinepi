//import { AudioIO, SampleFormat16Bit, IoStreamWrite, getDevices, SampleFormat24Bit, SampleFormatFloat32 } from "naudiodon2";

import Speaker from "speaker";

class SoundEngine {

    private static _instance: SoundEngine;
    public static get instance(): SoundEngine
    {
        if(!this._instance) {
            this._instance = new SoundEngine();
        }

        return this._instance;
    }
    output: Speaker;        

    private constructor() {
        this.output = new Speaker({
            channels: 2,
            bitDepth: 16,
            sampleRate: 44100
        });        
    }
    
    async playSound(buffer: Buffer) {
        console.log('playing');        
        this.output.write(buffer);
    }

}

export default SoundEngine.instance;