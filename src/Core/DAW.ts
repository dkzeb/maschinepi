import { container, singleton } from "tsyringe";
import { Project } from "./project";
import { UIController } from "../UI/UIController";
import { HardwareController } from "../Hardware/HardwareController";
import { EventBus } from "./EventBus";
import * as path from 'path';
import * as pkg from '../../package.json';
import * as crypto from 'crypto';
import { DisplayTarget } from "../Hardware/MK3Controller";
import { Widget, WidgetOptions } from "../Widgets/Widget";
import { StartupWidget } from "../Widgets/StartupWidget";
import { SysInfoWidget } from "../Widgets/SysInfoWidget";

export class DAWWidget extends Widget<unknown> {
    discriminator: string = 'DAWWidget';    
    widgetId?: string;
    
    constructor(widgetOpts: WidgetOptions) {
        super(widgetOpts);
        this.widgetId = crypto.randomUUID();
    }

    async render(): Promise<string> {
        console.log("DAW Widget Rendering!", this.widgetId);
        return '';
    }
}

@singleton()
export class DAW {
    currentProject!: Project;
    UI: UIController = container.resolve(UIController);
    hardwareController: HardwareController[] = [];
    eventBus: EventBus = container.resolve(EventBus);

    constructor() {
        this.setProject(new Project());        

        // register default widgets
        this.UI.registerWidget(new StartupWidget({
            eventTags: []
        }));

        this.UI.registerWidget(new SysInfoWidget({
            eventTags: []
        }));
    }

    setProject(project: Project) {
        this.currentProject = project;
        this.currentProject.loadProject();        
    }    

    async init() {
        this.showBootscreen();    
        
        setTimeout(() => {
            this.eventBus.processEvent({
                type: 'UIEvent',
                data: {
                    targetDisplay: DisplayTarget.Left,
                    type: 'openWidget',
                    widgetName: 'StartupWidget'
                }
            });

            this.eventBus.processEvent({
                type: 'UIEvent',
                data: {
                    targetDisplay: DisplayTarget.Right,
                    type: 'openWidget',
                    widgetName: 'SysInfoWidget'
                }
            });
        }, 3000);
    }

    private showBootscreen() {        

        // clear all displays
        this.UI.displays.forEach(d => d.clear());

        this.eventBus.processEvent({
            type: 'UIEvent',
            data: {
                targetDisplay: DisplayTarget.Left,   
                type: 'image',
                path: path.join(process.cwd(), 'data','images','maschinepi-splash.jpg')
            }
        });        
        this.eventBus.processEvent({
            type: 'UIEvent',
            data: {
                targetDisplay: DisplayTarget.Right,
                type: 'text',
                position: {
                    x: 50,
                    y: 50
                },
                text: `Maschine PI ${pkg.version}`
            }
        });
    }


}