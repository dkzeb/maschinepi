import { filter } from "rxjs";
import { Mk3Display } from "../MK3Controller";
import { Pad } from "../Pad";
import { Mode, ModeType } from "./Mode";
import { PadModeWidgetRight } from "../UI/widgets/padMode.widget";

const colorCodes = {
    'hat': [51, 255, 51 ],
    'kick': [255, 128, 0],
    'snare': [255, 255, 102],
    'other': [153, 51, 255]
}

export class PadMode extends Mode {
    type: ModeType = 'PadMode';        
    pads: Pad[];    
    
    constructor() {
        super();                
        // get the first group from the mixer
        const group = this.mixer.groups[0];        
        this.pads = [];
        for(let i = 1; i < 17; i++) {
            const p = new Pad('p'+i, false, group);            
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
        this.loadModeUI();

        this.ebus.events.pipe(filter((e => {
            return e.type === 'PadInput'
        }))).subscribe(ev => {                        
            const padName = ev.name!.split(':')[0];
            if(this.state.isLoadingPadSample) {
                this.startLoadingPad(padName);
            }        
            const p = this.pads.find(p => p.pIdx === padName);            
            if(p && p.sampleName) {                
                p.play();
                console.log('play', p.sampleName);                
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

    startLoadingPad(idx: string) {                
        this.state.activePadIdx = idx;

        (this.ui.right.getTopWidget() as PadModeWidgetRight).activePad = idx;
        this.ui.right.getTopWidget().update();

        this.ebus.processEvent({
            type: 'LoadWidget',
            data: {
                widgetName: 'FileList'
            }
        });

        this.ebus.events.pipe(filter(e => e.type === 'WidgetResult' && e.data.sample)).subscribe(e => {            
            this.ui.closeWidget(Mk3Display.both);
            console.log('state', this.state);
            const activePad = this.pads.find(p => p.pIdx === this.state.activePadIdx);            
            activePad?.loadSample(e.data.sample.name);

            let colorCode;
            // set the pad color based on sample type
            Object.keys(colorCodes).forEach(type => {

                if(e.data.sample.name.indexOf(type) >= 0) {
                    colorCode = colorCodes[type];
                }
            });            
            if(!colorCode) {
                colorCode = colorCodes['other'];
            }
            activePad!.color = colorCode;
            this.ui.mk3.mk3.indexed_leds[this.state.activePadIdx].setRGB(colorCode[0], colorCode[1], colorCode[2]);
        });
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
            this.setPadLights();
        } else {
            this.state.isLoadingPadSample = true;
            console.log('sample loading mode');
            for(let i = 1; i <= 16; i++) {
                this.controller.mk3.indexed_leds['p'+i]?.setWhiteBrightness(.5);
            }

            this.setPadLights();
        }
    }

    setPadLights() {
        for(let i = 1; i < 17; i++) {
            const p = this.pads.find(p => p.pIdx === 'p'+i);
            if(p && p.color) {
                this.controller.mk3.indexed_leds[p.pIdx].setRGB(p.color[0], p.color[1], p.color[2]);
            }
        }
    }
}