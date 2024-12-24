import { EventBus } from "./EventBus";
import { PrismaClient } from "@prisma/client";
//import {SoundEngine} from "./SoundEngine";
import { container, singleton } from "tsyringe";
import { StateController } from "./StateController";
import * as path from 'path';
import * as fs from 'fs';
//import { UILayer } from "src/old/Widgets/Widget";
import { loadImage } from "canvas";

@singleton()
export class StorageController {

    dataDir: string;
    prisma: PrismaClient;
    ebus: EventBus;

    constructor() {
        this.prisma = new PrismaClient();
        this.ebus = container.resolve(EventBus);            
        this.dataDir = path.join(process.cwd(), StateController.currentState.dataDirectory);
    }

    doesExist(localPath: string): boolean {
        if(localPath.indexOf(this.dataDir) !== 0) {
            localPath = path.join(this.dataDir, localPath);
        }        
        return fs.existsSync(localPath);
    }

    loadFile(filename: string) {        
        const data = fs.readFileSync(path.join(this.dataDir, filename));
        console.log('Data', data);
        return data;
    }

    async loadWidgetUI(widgetName): Promise<any[]> {
        const widgetPath = path.join(this.dataDir, widgetName);    
        const isAssetAnImage = (fp: string): boolean => {
            const fpSplit = fp.split('.');
            const ext = fpSplit[fpSplit.length - 1];
            return ['jpg', 'jpeg', 'svg', 'png'].includes(ext);
        }
        if(this.doesExist(widgetPath)) {
            const layers = fs.readdirSync(widgetPath).filter(fn => isAssetAnImage);            
            const uiLayers: any[] = [];
            
            layers.forEach(async (l, idx) => {
                uiLayers.push({
                    index: idx,
                    data: await loadImage(fs.readFileSync(path.join(widgetPath, l)))
                });
            })
            console.log('UILayers', uiLayers);
            return uiLayers;
        } else {
            return [];
        }
    }

    /*
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
    }*/

}