import { AudioContext } from "node-web-audio-api";
import { Transport } from "./Transport";
import AudioEngine from '../AudioEngine/audioEngine';
import { StorageController } from "./StorageController";
import { container } from "tsyringe";

export class DAW {

    // init loading all samples from data folder
    storage: StorageController = container.resolve(StorageController);

    transport: Transport;

    constructor() {
        this.transport = new Transport();        
        console.log('Constructed DAW');        

        this.storage.loadAudioData();
    }

}