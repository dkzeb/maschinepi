import { container, singleton } from "tsyringe";
import { UIController } from "../UI/UIController";
import { EventBus } from "./EventBus";
import * as path from 'path';
import * as pkg from '../../package.json';
import { DisplayTarget, MK3Controller } from "../Hardware/MK3Controller";
import { StartupWidget } from "../Widgets/StartupWidget";
import { SysInfoWidget } from "../Widgets/SysInfoWidget";
import { StateController } from "./StateController";
import { WidgetManager } from "./WidgetManager";
import { TestingWidget } from "../Widgets/TestingWidget";

@singleton()
export class OldDAW {
    UI: UIController = container.resolve(UIController);
    widgetManager: WidgetManager = container.resolve(WidgetManager);
    eventBus: EventBus = container.resolve(EventBus);
    MK3: MK3Controller = container.resolve(MK3Controller);    

    constructor() {
        // register default widgets
        this.widgetManager.registerWidget(new StartupWidget());
        this.widgetManager.registerWidget(new SysInfoWidget());
        this.widgetManager.registerWidget(new TestingWidget());
    }    

    async init() {
        this.showBootscreen();    
        
        this.MK3.padIntro();
        
        setTimeout(() => {
            this.eventBus.processEvent({
                type: 'WidgetEvent',
                data: {
                    targetDisplay: DisplayTarget.Left,
                    type: 'openWidget',
                    widgetName: 'StartupWidget'
                }
            });

            this.eventBus.processEvent({
                type: 'WidgetEvent',
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