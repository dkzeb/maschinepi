// src/audioEngine/Channel.ts
import { container } from 'tsyringe';
import AudioEngine from './audioEngine';

class Channel {
    private _gainNode: GainNode;
    public get gainNode(): GainNode
    {
        return this._gainNode;
    }

    private inputNode: AudioNode;
    private audioCtx: AudioContext;    

    constructor(audioCtx: AudioContext) {
        this.audioCtx = audioCtx;
        // Create a gain node for this channel
        this._gainNode = this.audioCtx.createGain();

        // Initialize input node (could be an oscillator, buffer, etc.)
        this.inputNode = this._gainNode;  // Default to gain node; replace with actual input node
    }

    // Connects this channel's output to another node
    public connect(destination: AudioNode) {
        this._gainNode.connect(destination);
    }

    // Disconnect this channel's output
    public disconnect() {
        this._gainNode.disconnect();
    }

    // Set volume for this channel
    public setVolume(volume: number) {
        this._gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }

    // Connect input source (e.g., an oscillator, buffer, or another node)
    public connectInput(inputNode: AudioNode) {
        inputNode.connect(this._gainNode);
        this.inputNode = inputNode;
    }

    public getInputNode(): AudioNode {
        return this.inputNode;
    }
}

export default Channel;