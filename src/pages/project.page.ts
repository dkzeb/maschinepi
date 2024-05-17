import { Page } from "src/classes/page";
import { QGridLayout, QPushButton } from "@nodegui/nodegui";
import { PrismaClient, Sample } from "@prisma/client";
import soundEngine from "src/classes/soundEngine";
const prisma = new PrismaClient();

export class ProjectPage extends Page {

    pads: QPushButton[];
    padSamples: Sample[];

    protected createLayout() {
        this.pageLayout = new QGridLayout();
        this.setLayout(this.pageLayout);
        this.setObjectName('projectPage')
        this.pads = [];
        for(let i = 0; i < 16; i++) {
            this.pads[i] = new QPushButton();
            this.pads[i].setText("Pad " + (i + 1));
            this.pads[i].addEventListener('clicked', () => this.handlePad(i));
        }
        this.pageLayout.addWidget(this.pads[12], 0, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[13], 0, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[14], 0, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[15], 0, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[8], 1, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[9], 1, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[10], 1, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[11], 1, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[4], 2, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[5], 2, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[6], 2, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[7], 2, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[0], 3, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[1], 3, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[2], 3, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[3], 3, 3, 1, 1);

        this.setStyleSheet(`
            #projectPage {
                background-color: 'black';
            }
            #projectPage QPushButton {
                height: 100px;
            }
        `);

        (async () => {
            // load in some samples for testing
            const kick = await prisma.sample.findFirst({
                where: {
                    name: 'kick 03.wav'
                }
            });
            const hat = await prisma.sample.findFirst({
                where: {
                    name: 'hat 10.wav'
                }
            });
            const snare = await prisma.sample.findFirst({
                where: {
                    name: 'snare 09.wav'
                }
            });

            this.padSamples = [];

            this.padSamples[0] = kick;
            this.padSamples[1] = snare;
            this.padSamples[2] = hat;
            
        })()
    }

    handlePad(padNumber: number) {
        console.log('Handle pad', padNumber);
        soundEngine.playSound(this.padSamples[padNumber].data);
    }    

}

export default new ProjectPage("ProjectPage");