import { container, singleton } from "tsyringe";
import { Project } from "./project";
import { UIController } from "../UI/UIController";
import { HardwareController } from "../Hardware/HardwareController";
import { EventBus } from "./EventBus";
import * as path from 'path';
import * as pkg from '../../package.json';
import * as crypto from 'crypto';
import { DisplayTarget } from "../Hardware/MK3Controller";
import { Widget } from "src/Widgets/widget";

export class DAWWidget extends Widget {
    widgetId: string;    
    render(): void {
        
    }
}

@singleton()
export class DAW {
    currentProject!: Project;
    UI: UIController = container.resolve(UIController);
    hardwareController: HardwareController[] = [];
    eventBus: EventBus = container.resolve(EventBus);

    widgets: DAWWidget[] = [];

    constructor() {
        this.setProject(new Project());        
    }

    setProject(project: Project) {
        this.currentProject = project;
        this.currentProject.loadProject();        
    }

    openWidget(w?: DAWWidget, widgetId?: string) {
        if(widgetId) {
            w = this.widgets.find(wd => wd.widgetId === widgetId);            
        }

        if(w) {
            if(!widgetId) {
                widgetId = crypto.randomUUID();       
                const dawW = {
                    ...w,
                    widgetId: widgetId,
                };                
                this.widgets.push(dawW);
                
            }
            w.render();
        }
    }

    async init() {
        this.showBootscreen();    
        setTimeout(() => {
            
        }, 1800);
    }

    private showBootscreen() {        
        this.eventBus.processEvent({
            type: 'UIEvent',
            data: {
                side: 'left',   
                type: 'image',
                path: path.join(process.cwd(), 'assets','images','maschinepi-splash.jpg')
            }
        });
        this.eventBus.processEvent({
            type: 'UIEvent',
            data: {
                side: 'right',
                type: 'text',
                position: {
                    x: 50,
                    y: 50
                },
                text: `Maschine PI ${pkg.version}`
            }
        })
    }


}