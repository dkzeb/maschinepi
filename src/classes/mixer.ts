import { DevPad } from "src/dev";
import { Sequence } from "./sequence";
import { Writable } from "stream";

export class Mixer {
    bufferSize: number = 128;
    groups: GroupOutput[];
    buffer: Buffer;
    mergeGroups(sequence: number[]) {
        const tempBuffer = Buffer.alloc(128);
        this.groups.forEach(g => {
            const groupBuffer = g.mergePads(sequence);
            for(let i = 0; i < this.bufferSize; i++) {
                tempBuffer[i] += groupBuffer[i];
            }
        });
        this.buffer = tempBuffer; // assign the mixed groups buffer to the mixer
    }

    constructor(bufferSize?: number) {
        if(bufferSize) {
            this.bufferSize = bufferSize;
        } else {
            this.bufferSize = 128;
        }
        this.buffer = Buffer.alloc(bufferSize);
    }

    playTick(outStream: Writable, buffers: Buffer[]) {        
        //this.mergeGroups();      
        outStream.write(this.buffer);
    }
}

export class GroupOutput {
    pads: PadOutput[];
    volume: number = 0.8;
    _buffer: Buffer;
    mergePads(activePads: number[]): Buffer {
        const tickPads: PadOutput[] = [];
        // determine the pads that are required        
        activePads.forEach((ap, idx) => {
            if(ap === 1) {
                tickPads[idx] = this.pads[idx];
            }
        });

        let longestBuffLength = 0;        
        // find the longest pad buffer
        tickPads.forEach((p) => {
            if(p.padBuffer && p.padBuffer.length > longestBuffLength) {
                longestBuffLength = p.padBuffer.length;                
            }
        })
        
        let tempBuffer = Buffer.alloc(longestBuffLength);
        tickPads.forEach(p => {
            // get the pad buffer
            if(p.padBuffer) {
                /*for(let i = 0; i < (bufferLength < p.padBuffer.length ? bufferLength : p.padBuffer.length); i++) {
                    tempBuffer[i] += p.padBuffer[i];
                }*/
                for(let i = 0; i < longestBuffLength; i++) {
                    const dataPiece = p.padBuffer[i] || 0x00;
                    tempBuffer[i] += dataPiece;
                }
            }
        });
        return tempBuffer;
    }
}

export class PadOutput {
    pad: DevPad;
    volume: number = 0.8;
    padBuffer: Buffer;
}