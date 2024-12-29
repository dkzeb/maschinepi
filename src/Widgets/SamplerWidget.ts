import { filter } from "rxjs";
import { EventBus } from "../Core/EventBus";
import { PixiWidget } from "./PixiWidget";
import { container } from "tsyringe";
import { MK3Controller } from "../Hardware/MK3Controller";
import { LED_Indexed } from "ni-controllers-lib/dist/lib/components/output/led_indexed";
import { UITools } from "../UI/UITools";

type ButtonState = {    
    cbs?: Record<string, () => void>
}

export class SamplerWidget extends PixiWidget {

    sampler: Sampler;
    buttonStates: Record<string, ButtonState> = {
        'default': {},
        'padDown': {
            cbs: {
                'browserPlugin': () => {}
            }
        }
    }

    controller: MK3Controller = container.resolve(MK3Controller);

    constructor() {
        super({
            name: 'Sampler',
            titlebar: {
                title: 'Sampler',
                color: "0xFFFFFF"
            }
        });
        this.sampler = new Sampler();
        
        this.ebus.events.pipe(filter(ev => ev.type === 'PadInput')).subscribe(ev => {
            console.log('padEv', ev);
            const p = this.sampler.pads.find(p => p.padName === ev.name!.split(':')[0]);
            if(p) {
                
            }
        });
    }


}

class Sampler {

    pads: Pad[] = [];

    constructor() {
        for(let i = 0; i < 16; i++) {
            const id = i + 1;
            const name = 'p' + padMap[i];
            console.log('id', id, 'name', name);
            const p = new Pad(id, name);
            this.pads.push(p);
            /*            
            this.pads.push(
                new Pad(id, 'p' + padMap[i])
            );*/
        }
    }

}

class Pad {
    padId: number;
    padName: string;
    get mappedName(): string {
        return 'Pad ' + this.padId;
    }

    private _active: boolean = false;

    set active(a: boolean) {
        this._active = a;        
    }

    state = {
        color: "#FFFFFF",
        brightness: .5
    }

    constructor(padId: number, padName: string) {
        this.padId = padId;
        this.padName = padName;
    }

    updateState(state: Partial<Pad['state']>, led: LED_Indexed) {
        
        console.log('update state', state, this.state);

        for(let p in state) {
            this.state[p] = state[p];
        }

        if(state.brightness) {
            led.setWhiteBrightness(state.brightness);
        }

        if(state.color) {
            const parsedColor = UITools.Hex2RGB(state.color);
            led.setRGB(parsedColor.r, parsedColor.g, parsedColor.b);
        }
    }
}

const padMap = [13, 14, 15, 16, 9, 10, 11, 12, 5, 6, 7, 8, 1, 2, 3, 4];