import { container } from "tsyringe";
import { EventBus } from "../EventBus";
import { MK3Controller, Mk3Display } from "../MK3Controller";
import { Mixer } from "../Mixer";
import { Subscription, filter } from "rxjs";
import { UIController } from "../UI/UIController";
import { SampleDisplay } from "../UI/widgets/sampleDisplay.widget";
import { PadModeWidgetLeft, PadModeWidgetRight } from "../UI/widgets/padMode.widget";
import { SampleList } from "../UI/widgets/fileList.widget";

export type ModeType = 'PadMode' | 'LiveMode';
export abstract class Mode {
    type?: ModeType;
    activeControls: ModeControl[] = [];
    controller: MK3Controller;
    ebus: EventBus;
    mixer: Mixer;
    controllerSubs: Subscription[] = [];
    ui: UIController;

    constructor() {
        this.controller = container.resolve(MK3Controller);
        this.ebus = container.resolve(EventBus);        
        this.mixer = new Mixer();        
        this.ui = new UIController([            
            new SampleList({ name: "FileList", targetDisplay: Mk3Display.left, hasMenu: true, hasTitlebar: true }),
            new SampleDisplay({ name: "SampleDisplay", targetDisplay: Mk3Display.right, hasMenu: true, hasTitlebar: true }),
            new PadModeWidgetLeft({ name: 'PadModeWidgetLeft', targetDisplay: Mk3Display.left}),
            new PadModeWidgetRight({ name: 'PadModeWidgetRight', targetDisplay: Mk3Display.right })            
        ]);
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