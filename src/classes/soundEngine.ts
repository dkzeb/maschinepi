//import { AudioIO, SampleFormat16Bit, IoStreamWrite, getDevices, SampleFormat24Bit, SampleFormatFloat32 } from "naudiodon2";

/*import * as Speaker from "speaker";

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
    outputBuffer: Buffer;
    samplesPerFrame: number = 128;
    chunks: Buffer[][] = [];

    private constructor() {
        this.output = new Speaker({
            channels: 2,
            bitDepth: 16,
            sampleRate: 44100,
            samplesPerFrame: this.samplesPerFrame
        });        
        this.output.on('drain', () => {
            this.outputBuffer.fill(0x00);
            this.chunks.forEach((chunkArray, idx) => {
                const c = chunkArray.shift();        
                if(c) {
                    c.forEach((bytes, idx) => {
                        this.outputBuffer[idx] += bytes;
                    })
                } else {
                    this.chunks.splice(idx, 1);
                }
            });            
            this.output.write(this.outputBuffer);
        });
        this.outputBuffer = Buffer.alloc(128);        
    }
    
    async playSound(buffer: Buffer) {                
        // we got a buffer in that we should play
        // first check if it is longer than current buffer
        if(buffer.length > this.outputBuffer.length) {
            // split the incomming buffer into chunks of 128
            const numberOfChunks = Math.ceil(buffer.length / this.outputBuffer.length);
            const buffChunks: Buffer[] = [];
            for(let i = 0; i < numberOfChunks; i++) {
                buffChunks.push(buffer.subarray(i * this.outputBuffer.length, i * this.outputBuffer.length + this.outputBuffer.length));
            }
            this.chunks.push(buffChunks);
            console.log('chunks', this.chunks.length);
        } else {
            this.chunks.push([buffer]);
        }
        
        this.output.write([0x00]); // run it
        //this.output.write(this.outputBuffer);
    }

    /*

    private processChunks() {
        this.buffer.fill(0x00); // empty out the buffer, then rebuild it
        this.pendingChunks.forEach((c, idx) => {
            const chunk = c.shift();
            if(c.length === 0) {
                this.pendingChunks.slice(idx, 1); // remove the chunk array if empty
            }
            for(let i = 0; i < this.bufferSize; i++) {
                this.buffer[i] += chunk[i];
            }
        });
        console.log('play buffer', this.buffer);
    }
    */

//}

//export default SoundEngine.instance;