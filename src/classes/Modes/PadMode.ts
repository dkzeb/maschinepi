import { MaschineMk3 } from "ni-controllers-lib";
import { Mode, ModeType } from "./ModeController";
import { BaseController } from "ni-controllers-lib/dist/lib/base_controller";
import { EventBus } from "../EventBus";
import { filter } from "rxjs";
import { Group, Mixer } from "../Mixer";
import { Sample } from "@prisma/client";
import { SoundEngine } from "../SoundEngine";
import { GainNode } from "node-web-audio-api";

type ModeConfig = {
    leds: (keyof BaseController['config']['output']['leds'])
}

export class Pad {
    color: string;
    pIdx: string;
    selected: boolean;
    gainNode: GainNode;
    group: Group;
    sampleName?: string;

    constructor(color: string, pIdx: string, selected: boolean, group: Group, private soundEngine: SoundEngine) {
        this.color = color;
        this.pIdx = pIdx;
        this.selected = selected;
        this.group = group;
        this.gainNode = new GainNode(this.soundEngine.ctx);
        this.gainNode.connect(this.group.groupNode);
    }

    loadSample(name:string){
        this.sampleName = name;
    }

    play() {
        if(!this.sampleName) {
            return;
        }
        const sampleSource = this.soundEngine.ctx.createBufferSource();
        const sample = this.soundEngine.sources[this.sampleName];
        sampleSource.buffer = sample;
        sampleSource.connect(this.gainNode);
        sampleSource.onended = () => sampleSource.disconnect();
        sampleSource.play();
    }
}

export class PadMode<PadConfig> implements Mode {
    type: ModeType = 'PadMode';
    controller: MaschineMk3;
    ebus: EventBus;
    pads: Pad[];
    
    constructor(ebus: EventBus, controller: MaschineMk3, mixer: Mixer) {
        this.controller = controller;
        this.ebus = ebus;        

        // get the first group from the mixer
        const group = mixer.groups[0];

        this.pads = [];
        for(let i = 1; i < 17; i++) {
            const p = new Pad('white', 'p'+i, false, group, mixer.soundEngine);            
            this.pads.push(p);
        }

        if(this.setup)
            this.setup();
    }


    state: Record<string, any> = {
        isLoadingPadSample: false,
        activePadIdx: '',
        activePad: {}
    };

    activeControls: string[] = [];



    setup() {        
        // setup controller state (leds to be on, events to listen for etc)
        this.setActiveButtons([
            'select', 'padMode', 'fileSave', 'play', 'restartLoop', 'tapMetro'
        ]);
        // setup the event to enter padload mode
        this.ebus.events.pipe(filter((e => {
            return e.type ==='ButtonInput' && e.name?.indexOf('select') === 0;
        }))).subscribe(e => {
            const released = (!!e.name && e.name.indexOf('released') > -1) ?? false;
            this.toggleSampleLoading(released);
        });

        this.ebus.events.pipe(filter((e => {
            return e.type === 'PadInput'
        }))).subscribe(ev => {                        
            if(this.state.isLoadingPadSample) {
                this.loadPad(ev.name!.split(':')[0]);
            }        
        });
    }

    loadPad(idx: string) {
        this.state.activePad = this.pads.find(p => p.pIdx === idx);
        if(this.state.activePad) {
            this.state.activePadIdx = idx;

            // load the sample loader widget thing
            this.ebus.processEvent({
                type: 'LoadWidget',
                data: {
                    widgetName: 'FileList'
                }
            });
            this.ebus.events.pipe(filter(e => e.type === 'WidgetResult' && e.data.selectedSample)).subscribe((e) => {
                console.log('load sample with name', e.data.selectedSample, 'to pad', idx);
            });
        } else {
            this.state.activePadIdx = -1;
        }
    }

    setActiveButtons(controls: string[]) {
        this.activeControls = controls;
        for(let btn of this.activeControls) {            
            this.controller?.setLED(btn, 10000);
        }
    }

    toggleSampleLoading(released: boolean) {
        if(released) {
            this.state.isLoadingPadSample = false;
            console.log('sample loading mode off');
            for(let i = 1; i <= 16; i++) {
                this.controller.indexed_leds['p'+i]?.setOff();
                if(this.state.activePadIdx) {
                    this.controller.indexed_leds[this.state.activePadIdx].setWhiteBrightness(1);
                    this.controller.indexed_leds[this.state.activePadIdx].setWhite();                    
                }
            }

        } else {
            this.state.isLoadingPadSample = true;
            console.log('sample loading mode');
            for(let i = 1; i <= 16; i++) {
                this.controller.indexed_leds['p'+i]?.setWhiteBrightness(.5);
            }
        }

    }
}