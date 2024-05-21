import { GroupOutput, Mixer, PadOutput } from './classes/mixer';
import { PrismaClient, Sample } from '@prisma/client';
import { Sequence } from './classes/sequence';
import soundEngine from './classes/webaudioSE';

export class DevPad {
  sample: Sample;
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export class Dev {

  seq: Sequence;
  g1: GroupOutput;
  g2: GroupOutput;
  m: Mixer;

  async dev() {
    // make 1 mixer
    this.m = new Mixer(128);
    // create 2 groups
    this.g1 = new GroupOutput();
    this.g2 = new GroupOutput();
    // create 2 pads for each group
    const g1p1 = new PadOutput();
    const g1p2 = new PadOutput();
    const g2p1 = new PadOutput();
    const g2p2 = new PadOutput();

    this.g1.pads = [g1p1, g1p2];
    this.g2.pads = [g2p1, g2p2];
    this.m.groups = [this.g1, this.g2];

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

    soundEngine.addSource(kick.name, kick.data);
    soundEngine.addSource(snare.name, snare.data);

    g1p1.pad = new DevPad("p1");
    g1p2.pad = new DevPad("p2");
    g1p1.pad.sample = kick;
    g1p2.pad.sample = snare;
    g1p1.padBuffer = kick.data;    
    g1p2.padBuffer = snare.data;
    
    this.seq = new Sequence(
      [[1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 1, 0]]
    );    
    
    // bpmInSec = 60 / bpm
    const bpm = 60 / 120; // hiphop, yeah!
          
    setInterval(() => {                              
      this.processTick();
    }, (bpm * 1000) / 2);    
  }

  processTick() {
    const seqSlices = this.seq.tick();
    // we only have 1 group (right now), so the sequence is valid for that group, now check the indexes and see if a sample should play    
    // TODO: make sequences part of groups, so we can run through each group and prcoess the sequence tick  
    const samplesToPlay: string[] = [];
    seqSlices.forEach((shouldPlay, idx) => {
      if(shouldPlay === 1) {
        samplesToPlay.push(this.g1.pads[idx].pad.sample.name);
      }
    });    
    soundEngine.playSamples(samplesToPlay);
  }
}

const d = new Dev();
d.dev();