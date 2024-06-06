import { filter } from "rxjs";
import { Mk3Display } from "../MK3Controller";
import { Pad } from "../Pad";
import { Mode, ModeType } from "./Mode";

export class PadMode extends Mode {
    type: ModeType = 'PadMode';        
    pads: Pad[];    
    
    constructor() {
        super();                
        // get the first group from the mixer
        const group = this.mixer.groups[0];        
        this.pads = [];
        for(let i = 1; i < 17; i++) {
            const p = new Pad('white', 'p'+i, false, group);            
            this.pads.push(p);
        }        
    }

    state: Record<string, any> = {
        isLoadingPadSample: false,
        activePadIdx: '',
        activePad: {}
    };

    async setup() {        
        console.log('Setting up padmode');
        // setup controller state (leds to be on, events to listen for etc)
        this.setActiveControls([
            {
                name: 'select',
                action: (released: boolean) => this.toggleSampleLoading(released)                
            },
            {
                name: 'pluginInstance',
                action: () => this.state.isLoadingPadSample = false
            },
            {
                name: 'padMode',
                action: () => console.log('padMode')
            },
            {
                name: 'fileSave',
                action: () => console.log('fileSave')
            },
            {
                name: 'mixer',
                action: () => console.log('mixer')
            }
        ]);
        // setup the event to enter padload mode
        /*this.ebus.events.pipe(filter((e => {
            return e.type ==='ButtonInput' && e.name?.indexOf('select') === 0;
        }))).subscribe(e => {
            const released = (!!e.name && e.name.indexOf('released') > -1) ?? false;
            this.toggleSampleLoading(released);
        });*/

        this.loadModeUI();

        this.ebus.events.pipe(filter((e => {
            return e.type === 'PadInput'
        }))).subscribe(ev => {                        
            if(this.state.isLoadingPadSample) {
                this.loadPad(ev.name!.split(':')[0]);
            }        
        });               
    }

    loadModeUI() {
        // load the widgets
        this.ebus.processEvent({
            type: 'LoadWidget',
            data: {
                widgetName: 'PadModeWidgetLeft',
                targetMK3Display: Mk3Display.left                    
            }
        });

        this.ebus.processEvent({
            type: 'LoadWidget',
            data: {
                widgetName: 'PadModeWidgetRight',
                targetMK3Display: Mk3Display.right                    
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
            this.ebus.events.pipe(filter(e => e.type === 'WidgetResult' && e.data.resultData.sample)).subscribe((e) => {
                console.log('load sample with name', e.data.resultData.sample.name, 'to pad', idx);
                const pad = this.pads.find(p => p.pIdx === idx);
                if(pad) {
                    pad.sampleName = e.data.resultData.sample.name;
                }
            });
        } else {
            this.state.activePadIdx = -1;
        }
    }    

    toggleSampleLoading(released: boolean) {
        if(released) {
            this.state.isLoadingPadSample = false;
            console.log('sample loading mode off');
            for(let i = 1; i <= 16; i++) {
                this.controller.mk3.indexed_leds['p'+i]?.setOff();
                if(this.state.activePadIdx) {
                    this.controller.mk3.indexed_leds[this.state.activePadIdx].setWhiteBrightness(1);
                    this.controller.mk3.indexed_leds[this.state.activePadIdx].setWhite();                    
                }
            }
        } else {
            this.state.isLoadingPadSample = true;
            console.log('sample loading mode');
            for(let i = 1; i <= 16; i++) {
                this.controller.mk3.indexed_leds['p'+i]?.setWhiteBrightness(.5);
            }
        }
    }
}