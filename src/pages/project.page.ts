import { PrismaClient, Sample } from "@prisma/client";
import { QAction, QGridLayout, QMainWindow, QMenu, QMenuBar } from "@nodegui/nodegui";

import { Pad } from "src/classes/pad";
import { Page } from "src/classes/page";
import WidgetRouter from '../classes/router';
import SoundEngine from '../classes/webaudioSE';
import { MaschineMk3 } from "ni-controllers-lib";
export class ProjectPage extends Page {

    pads: Pad[];
    samples: Sample[];
    prisma: PrismaClient;
    controller: MaschineMk3;

    protected createLayout() {
        this.pageLayout = new QGridLayout();
        this.setLayout(this.pageLayout);
        this.setObjectName('projectPage')

        if(this.pads) {
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
        }
       

        this.setStyleSheet(`
            #projectPage {
                background-color: 'black';
            }
            #projectPage QPushButton {
                height: 100px;
            }
        `);            
    }

    public override onLoad(): void {
        const menuBar = new QMenuBar();
        const fileMenu = new QMenu();

        this.pads = [];
        for(let i = 0; i < 16; i++) {
            this.pads[i] = new Pad("pad"+i);
            this.pads[i].setText("Pad " + (i + 1));
        }
        this.createLayout();

        const closeAction = new QAction();
        closeAction.setText('Close Project');
        closeAction.addEventListener('triggered', () => {
            WidgetRouter.navigate('main');            
        });
        fileMenu.addAction(closeAction);
        fileMenu.setTitle("File");
        menuBar.addMenu(fileMenu);
        const sampleMenu = new QMenu();
        sampleMenu.setTitle("Samples");
        sampleMenu.addAction("Set Load Mode");
        menuBar.addMenu(sampleMenu);
        (this.window() as QMainWindow).setMenuBar(menuBar);

        if(this.controller) {
            console.log('binding controller', console.log('this.pads', this.pads));
            this.controller.on('p:pressed', (idx, pressure) => {
                console.log('pressed', idx, 'with pressure', pressure);
                if(this.pads[idx]) {
                    if(this.pads[idx].sample) {
                        this.pads[idx].playSample();
                        this.controller.indexed_leds['p'+(idx + 1)].setColorByNumberHelper(3, false, true);
                    }
                }
            });

            this.controller.on('p:released', (idx, pressure) => {
                if(this.pads[idx].sample) {
                    this.controller.indexed_leds["p"+ (idx + 1)].setColorByNumberHelper(3, false, false);
                }
            });
        }

        this.loadSampleToPad('snare 04.wav', this.pads[13]);
        this.loadSampleToPad('kick 04.wav', this.pads[12]);
        this.loadSampleToPad('hat 04.wav', this.pads[14]);
    }

    async loadSampleToPad(sampleName, pad: Pad) {
        if(!this.prisma) {
            this.prisma = new PrismaClient();
        }
        const sample = await this.prisma.sample.findFirstOrThrow({
            where: {
                name: sampleName
            }
        });
        
        pad.loadSample(sample);
        if(this.controller) {
            console.log('pad name', pad.name);
            const p = parseInt(pad.name.replace('pad', ''));
            this.controller.indexed_leds['p' + (p + 1)].setColorByNumberHelper(3, false, false);
        }
    }
}

export default new ProjectPage("ProjectPage");