import { AudioBuffer, AudioBufferSourceNode, AudioContext, GainNode } from "node-web-audio-api";
import Mixer from "./mixer";
import { container } from "tsyringe";
import { readFileSync, PathLike } from "fs";
import * as wav from 'node-wav';
import * as fs from 'fs';
import { StorageController } from "src/Core/StorageController";

// src/audioEngine/AudioEngine.ts
class AudioEngine {        

    private static _instance?: AudioEngine;
    private audioContext: AudioContext;
    private gainNode: GainNode;

    private audioBuffers: Map<string, AudioBuffer> = new Map();

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

    async loadAudioBuffer(path: PathLike, name?: string) {                
        const localFile = readFileSync(path);
        const result = await wav.decode(localFile);                
        if(!result) {
            return;
        }
        const audioBuffer = new AudioBuffer({
            numberOfChannels: result.channelData.length,
            length: result.channelData[0].length,
            sampleRate: result.sampleRate,
          });
        result.channelData.forEach((data, index) => {
            audioBuffer.getChannelData(index).set(data);
        })    
        if(!name) {
            const nameSplit = path.toString().split('/');
            name = nameSplit[nameSplit.length - 1];
        }                    
        this.audioBuffers.set(name, audioBuffer);
    }

    async playAudioBuffer(name: string) {
        const ab = this.audioBuffers.get(name);
        if(!ab) {
            return;
        }         
        const source = this.audioContext.createBufferSource();
        source.buffer = ab;
        source.connect(this.audioContext.destination);
        source.start();
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
}

export default AudioEngine.instance;
