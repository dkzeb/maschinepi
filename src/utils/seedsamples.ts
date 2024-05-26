import { PrismaClient } from "@prisma/client";
import * as fs from 'node:fs';
import * as path from 'node:path';

import { WaveFile } from "wavefile";
const prisma = new PrismaClient();

async function seed() {
    try {
        const sampleRoot = path.join(process.cwd(), 'assets', 'samples');
        const files = fs.readdirSync(sampleRoot);
        console.log(files.length, 'samples found');

        for(let f of files) {
            
            // check if the sample has already been seeded
            const c = await prisma.sample.count({
                where: {
                    name: f
                }
            });
            if(c > 0) {
                console.log('Sample', f, 'has already been seeded, skipping...');
            } else {
                const waveFileData = fs.readFileSync(path.join(sampleRoot, f));
                const wav = new WaveFile(waveFileData);                          
                wav.toSampleRate(44100);
                console.log('f', f);
                await prisma.sample.create({
                    data: {
                        name: f,
                        data: Buffer.from(wav.toBuffer())
                    }
                });
            }            
        }
    } catch(e) {
        throw e;
    }
}

seed().then(
    async () => {
        console.log('Done Seeding');
        await prisma.$disconnect();
        process.exit(0);
    }
).catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});