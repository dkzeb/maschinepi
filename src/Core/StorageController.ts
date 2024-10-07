import { EventBus } from "./EventBus";
import { PrismaClient } from "@prisma/client";
//import {SoundEngine} from "./SoundEngine";
import { container } from "tsyringe";

export class StorageController {

    prisma: PrismaClient;
    ebus: EventBus;
  //  soundEngine: SoundEngine;

    constructor() {
        this.prisma = new PrismaClient();
        this.ebus = container.resolve(EventBus);
    //    this.soundEngine = container.resolve(SoundEngine);
        this.loadAllSamples();
    }

    async loadAllSamples() {
        const samples = await this.prisma.sample.findMany();
        for(let s of samples) {
      //      await this.soundEngine.addSource(s.name, s.data);
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
        //await this.soundEngine.addSource(sampleName, sample.data);
    }

}