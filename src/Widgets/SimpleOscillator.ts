// src/widgets/SimpleOscillator.ts
import { container } from 'tsyringe';
import AudioEngine from '../AudioEngine/audioEngine';
import Mixer from '../AudioEngine/mixer';
import Channel from '../AudioEngine/channel';
import { Instrument } from 'src/AudioEngine/instrument';

class SimpleOscillator implements Instrument {
    private oscNode!: OscillatorNode;
    private channel!: Channel;
    private audioCtx!: AudioContext;

    constructor() {                
    }

    initOsc() {
        const mixer = container.resolve(Mixer);        
        this.audioCtx = mixer.audioCtx;

        this.channel = mixer.getChannel(0);

        // Create an oscillator node
        this.oscNode = this.audioCtx.createOscillator();
        this.oscNode.type = 'sine'; // Set the waveform type
        this.oscNode.frequency.setValueAtTime(440, this.audioCtx.currentTime); // Set frequency to A4 (440 Hz)

        this.channel.connectInput(this.oscNode);
    }

    public start() {
        this.oscNode.start();
    }

    public stop() {
        this.oscNode.stop();
    }

    public setChannelVolume(volume: number) {     
        this.channel.setVolume(volume);
    }
}

export default SimpleOscillator;
