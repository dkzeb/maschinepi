import { container } from "tsyringe";
import { EventBus } from "../EventBus";
import { MK3Controller } from "../MK3Controller";
import { Mixer } from "../Mixer";
import { Subscription, filter } from "rxjs";

export type ModeType = 'PadMode' | 'LiveMode';
export abstract class Mode {
    type?: ModeType;
    activeControls: ModeControl[] = [];
    controller: MK3Controller;
    ebus: EventBus;
    mixer: Mixer;
    controllerSubs: Subscription[] = [];

    constructor() {
        this.controller = container.resolve(MK3Controller);
        this.ebus = container.resolve(EventBus);        
        this.mixer = new Mixer();        
    }

    abstract setup();

    destroy() {
        this.controllerSubs.forEach(s => s.unsubscribe());
    }

    setActiveControls(controls: ModeControl[]) {
        this.activeControls = controls;        
        for(let c of this.activeControls) {            
            this.controller.mk3.setLED(c.name, 10000);
            const actionSub = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name?.indexOf(c.name) === 0)).subscribe((e) => {
                c.action(e.name!.indexOf('released') > 0);
            });
            this.controllerSubs.push(actionSub);
        }
    }
}

export type ModeControl = {
    name: string;
    action: (released: boolean) => void;
}