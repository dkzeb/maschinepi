import * as Speaker from 'speaker';

import { GroupOutput, Mixer, PadOutput } from './classes/mixer';
import { PrismaClient, Sample } from '@prisma/client';

import { Sequence } from './classes/sequence';

export class DevPad {
  sample: Sample;
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class Dev {

  async dev() {
    // make 1 mixer
    const m = new Mixer(128);
    // create 2 groups
    const g1 = new GroupOutput();
    const g2 = new GroupOutput();
    // create 2 pads for each group
    const g1p1 = new PadOutput();
    const g1p2 = new PadOutput();
    const g2p1 = new PadOutput();
    const g2p2 = new PadOutput();

    g1.pads = [g1p1, g1p2];
    g2.pads = [g2p1, g2p2];
    m.groups = [g1, g2];

    const prisma = new PrismaClient();
    // load in some samples
    const kick = await prisma.sample.findFirst({
      where: {
        name: 'hat 08.wav'
      }
    });
    const snare = await prisma.sample.findFirst({
      where: {
        name: 'snare 02.wav'
      }
    });
    g1p1.pad = new DevPad("p1");
    g1p2.pad = new DevPad("p2");
    g1p1.pad.sample = kick;
    g1p2.pad.sample = snare;
    g1p1.padBuffer = kick.data;    
    g1p2.padBuffer = snare.data;


    const spk = new Speaker({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100,
      samplesPerFrame: 128
    });
    
    const seq = new Sequence(
      [[1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 1, 0]]
    );    
    
    // bpmInSec = 60 / bpm
    const bpm = 60 / 120; // hiphop, yeah!
          
    setInterval(() => {                        
      console.log('tick');
      const seqSlices = seq.tick();
      // we only have 1 group (right now), so the sequence is valid for that group, now check the indexes and see if a sample should play
      const sliceBuffers = [];
      seqSlices.forEach((shouldPlay, idx) => {
        // if slice index (si) is 1 we should play the pad for the corresponding index
        if(shouldPlay) {
          console.log('play', g1.pads[idx].pad.sample.name)
          sliceBuffers.push(g1.pads[idx].padBuffer);
        }
      });
      console.log('--- end tick ---');
      
    }, (bpm * 1000));    
  }
}

const d = new Dev();
d.dev();