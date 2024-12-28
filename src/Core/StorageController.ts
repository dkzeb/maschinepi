import { EventBus } from "./EventBus";
import { PrismaClient } from "@prisma/client";
import { container, singleton } from "tsyringe";
import { StateController } from "./StateController";
import * as path from 'path';
import * as fs from 'fs';

@singleton()
export class StorageController {

    dataDir: string;
    sampleDir: string;
    prisma: PrismaClient;
    ebus: EventBus;

    constructor() {
        this.prisma = new PrismaClient();
        this.ebus = container.resolve(EventBus);            
        this.dataDir = path.join(process.cwd(), process.env.MPI_DATA_DIR ?? '');
        this.sampleDir = path.join(this.dataDir, 'samples');
    }

    doesExist(localPath: string): boolean {
        if(localPath.indexOf(this.dataDir) !== 0) {
            localPath = path.join(this.dataDir, localPath);
        }        
        return fs.existsSync(localPath);
    }

    loadFile(filename: string) {        
        const data = fs.readFileSync(filename);
        return data;
    }

    listDir(p: fs.PathLike) {
        return fs.readdirSync(p);
    }

    joinPath(... args: string[]) {
        return path.join(...args);
    }

}