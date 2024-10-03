import { Canvas, CanvasRenderingContext2D } from "canvas";
import { filter } from "rxjs";
import { EventBus, MPIEvent } from "src/Core/EventBus";
import { UIControl } from "src/UI/uiControl";
import { container } from "tsyringe";

export type WidgetEvent = MPIEvent & {
    data: WidgetData
}

interface IWidget {  
  render(): void;  
  add?(widget: IWidget): void;
  remove?(widget: IWidget): void;
  getChild?(index: number): IWidget | undefined;
};

type WidgetData = {};
type WidgetOptions = {
    canvas: Canvas,
    eventTags: string[],
    controls: UIControl[],
    children?: Widget[]
}

export abstract class Widget implements IWidget {    

    canvas: Canvas;
    ctx: CanvasRenderingContext2D;
    controls: UIControl[] = [];
    children?: Widget[];

    render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.controls.forEach(ctrl => {
            ctrl.drawGUI(this.ctx);
        });
    };    
    ebus: EventBus = container.resolve(EventBus);

    constructor(widgetOpts: WidgetOptions) {
        widgetOpts.eventTags.forEach(etag => {
            this.ebus.events.pipe(filter(ev => ev.type === etag)).subscribe(ev => {            
                console.log('Widget Event Caught', ev);
            });
        });
        
        this.children = widgetOpts.children        

        this.controls = widgetOpts.controls;
        this.canvas = widgetOpts.canvas;
        this.ctx = this.canvas.getContext("2d");
    }
}
