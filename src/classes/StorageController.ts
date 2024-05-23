import { EventBus } from "./EventBus";
import { PrismaClient } from "@prisma/client";
import {SoundEngine} from "./SoundEngine";

export class StorageController {

    prisma: PrismaClient;
    ebus: EventBus;
    soundEngine: SoundEngine;

    constructor(ebus: EventBus, soundEngine: SoundEngine) {
        this.prisma = new PrismaClient();
        this.ebus = ebus;
        this.soundEngine = soundEngine;
        this.loadAllSamples();
    }

    async loadAllSamples() {
        const samples = await this.prisma.sample.findMany();
        for(let s of samples) {
            await this.soundEngine.addSource(s.name, s.data);
        };
        this.ebus.processEvent({
            type: 'Init',
            name: 'StorageController',
            data: {
                message: `loaded ${samples.length} into memory`
            }
        })
    }

    async addSampleSource(sampleName: string): Promise<void> {
        const sample = await this.prisma.sample.findFirstOrThrow({
            where: {
                name: sampleName
            }
        });
        await this.soundEngine.addSource(sampleName, sample.data);
    }

}