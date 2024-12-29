import { AudioContext, GainNode, AudioBuffer, AnalyserNode } from "node-web-audio-api";
import Mixer from "./mixer";
import { container } from "tsyringe";
import { StorageController } from "../Core/StorageController";
import { WaveFile } from "wavefile";
import { Graphics } from "@pixi/node";
import { UITools } from "../UI/UITools";

type AudioClip = {
    buffer: AudioBuffer,
    gain: GainNode,
    analyzer: AnalyserNode
}

// src/audioEngine/AudioEngine.ts
class AudioEngine {    
    private static _instance?: AudioEngine;
    private audioContext: AudioContext;
    private gainNode: GainNode;

    private storage: StorageController = container.resolve(StorageController);

    sources: Record<string, AudioBuffer> = {};
    waveforms: Record<string, Graphics> = {};

    private _mixer?: Mixer;
    public set mixer(m: Mixer) {
        this._mixer = m;
    }
    public get mixer(): Mixer {
        if(!this._mixer) {
            throw new Error("NO MIXER TO GET!");
        }
        return this._mixer
    }

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

    public async playSource(sourceName: string) {

        if(!this.sources[sourceName]) {
            await this.loadSource(sourceName);    
        }

        const smpl = this.sources[sourceName];
        const smplSource = this.audioContext.createBufferSource();
        smplSource.buffer = smpl;
        smplSource.connect(this.mixer.getChannel(0).gainNode);
        smplSource.onended = () => smplSource.disconnect();
        smplSource.start();
        
    }

    public async getSource(sourceName): Promise<AudioBuffer> {
        if(!this.sources[sourceName]) {
            await this.loadSource(sourceName);
        }

        return this.sources[sourceName];
    }

    public async getWaveform(sourceName): Promise<Graphics> {
        if(!this.waveforms[sourceName]) {
            await this.loadSource(sourceName);
        }

        return this.waveforms[sourceName];
    }

    async playSources(sampleNames: string[]) {
        const buffers: AudioBufferSourceNode[] = [];  
        
        for(let sn of sampleNames) {
            if(!this.sources[sn]) {
                await this.loadSource(sn);
            }
            const output = this.audioContext.createBufferSource();
            output.buffer = this.sources[sn];
            output.connect(this.mixer.getChannel(0).gainNode);
            output.onended = () => output.disconnect();
            buffers.push(output);
        }

        buffers.forEach(output => output.start());
    
    }

    private async loadSource(sourceName: string) {
        
        // check if source is already loaded, if so, abort
        if(this.sources[sourceName]) {
            return; 
        }
        const sourceData = this.storage.loadFile(
            this.storage.joinPath(
                this.storage.sampleDir,
                sourceName
            )
        )

        const wav = new WaveFile(sourceData);                          
        wav.toSampleRate(44100);
        const waveBuff = Buffer.from(wav.toBuffer());
        const audioBuff = await this.audioContext.decodeAudioData(waveBuff.buffer); 
        this.sources[sourceName] = audioBuff;
        this.waveforms[sourceName] = UITools.DrawWaveform(audioBuff);
    }
}

export default AudioEngine.instance;
