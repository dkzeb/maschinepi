import { container, singleton } from "tsyringe";
import { Project } from "./project";
import { UIController } from "../UI/UIController";
import { EventBus } from "./EventBus";
import * as path from 'path';
import * as pkg from '../../package.json';
import { DisplayTarget, MK3Controller } from "../Hardware/MK3Controller";
import { StartupWidget } from "../Widgets/StartupWidget";
import { SysInfoWidget } from "../Widgets/SysInfoWidget";

@singleton()
export class DAW {
    currentProject!: Project;
    UI: UIController = container.resolve(UIController);
    eventBus: EventBus = container.resolve(EventBus);
    MK3: MK3Controller = container.resolve(MK3Controller);

    constructor() {
        this.setProject(new Project());        

        // register default widgets
        this.UI.registerWidget(new StartupWidget({}));

        this.UI.registerWidget(new SysInfoWidget({}));
    }

    setProject(project: Project) {
        this.currentProject = project;
        this.currentProject.loadProject();        
    }    

    async init() {
        this.showBootscreen();    

        this.MK3.padIntro();
        
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