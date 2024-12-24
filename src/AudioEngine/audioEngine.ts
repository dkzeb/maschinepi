import { AudioContext, GainNode, AudioBuffer } from "node-web-audio-api";
import Mixer from "./mixer";
import { container } from "tsyringe";
import { StorageController } from "../Core/StorageController";


// src/audioEngine/AudioEngine.ts
class AudioEngine {    
    private static _instance?: AudioEngine;
    private audioContext: AudioContext;
    private gainNode: GainNode;

    private storage: StorageController = container.resolve(StorageController);

    sources: Record<string, AudioBuffer> = {};

    //private workletNode: AudioWorkletNode;
    private mixer?: Mixer;

    public static get instance(): AudioEngine {
        if(!this._instance)
            console.info("Creating AudioEngine");
            this._instance = new AudioEngine();
            
        return this._instance;
    }

    private constructor() {
        // Initialize the AudioContext with low-latency settings
        this.audioContext = new AudioContext({
            latencyHint: 'interactive',
            sampleRate: 44100, // Set your preferred sample rate
        });                
        this.gainNode = this.audioContext.createGain();
    }    

    public async initAudioEngine() {                
        try {
            this.mixer = await container.resolve(Mixer).initMixer();
            /*
            // Load the AudioWorklet processor script
            await this.audioContext.audioWorklet.addModule('worklets/halfer-worklet.js');            
            // Create an instance of AudioWorkletNode
            this.workletNode = new AudioWorkletNode(this.audioContext, 'HalfGainer');
    
            // Connect the worklet to the gain node
            this.workletNode.connect(this.gainNode);*/

            console.info("AudioWorklet loaded and connected successfully");
        } catch (error) {
            console.error("Failed to load AudioWorklet", error);
        }        
    }

    // Additional utility methods to interact with the audio graph
    public connectNode(node: AudioNode) {
        node.connect(this.gainNode);
    }

    public disconnectNode(node: AudioNode) {
        node.disconnect(this.gainNode);
    }

    public getContext(): AudioContext {
        return this.audioContext;
    }

    public playSource(sourceName: string) {

    }

    private loadSource(sourceName: string) {
        
    }
}

export default AudioEngine.instance;
