// src/audioEngine/Mixer.ts
import Channel from './channel';
import AudioEngine from './audioEngine';
import { singleton } from 'tsyringe';

@singleton()
class Mixer {
    private channels!: Channel[];
    private _masterChannel!: Channel;
    public get masterChannel(): Channel {
        return this._masterChannel;
    }
    private _masterGain!: GainNode;
    public get masterGain(): GainNode {
        return this._masterGain;
    }


    private _audioCtx!: AudioContext;
    private set audioCtx(ctx: AudioContext) {        
        this._audioCtx = ctx;
    }
    public get audioCtx(): AudioContext {        
        if(!this._audioCtx) {
            this._audioCtx = AudioEngine.getContext();
        }
        return this._audioCtx;
    }

    constructor() {        
    }

    public initMixer() {
        this.channels = [];        
        // Create a master gain node
        this._masterGain = this.audioCtx.createGain();

        // Create a master channel
        this._masterChannel = new Channel(this.audioCtx);
        this._masterChannel.connect(this._masterGain);
        const numChannels = 8;

        // Create the channels and connect them to the master gain node
        for (let i = 0; i < numChannels; i++) {
            const channel = new Channel(this.audioCtx);
            channel.connect(this.masterChannel.gainNode);
            this.channels.push(channel);
        }

        // Connect the master gain node to the audio context destination
        this.masterGain.connect(this.audioCtx.destination);

        return this;
    }

    // Get a specific channel by index
    public getChannel(index: number): Channel {
        return this.channels[index];
    }

    // Set the volume of the master channel
    public setMasterVolume(volume: number) {
        this.masterGain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }

    // Add more channels dynamically
    public addChannel(): Channel {
        const newChannel = new Channel(this.audioCtx);
        newChannel.connect(this.masterGain);
        this.channels.push(newChannel);
        return newChannel;
    }

    // Remove a channel by index
    public removeChannel(index: number) {
        if (index >= 0 && index < this.channels.length) {
            const channel = this.channels[index];
            channel.disconnect();
            this.channels.splice(index, 1);
        }
    }
}

export default Mixer;