import { Widget } from "../Widgets/Widget";
import { container, singleton } from "tsyringe";
import * as crypto from 'crypto';
import { UIController } from "../UI/UIController";
import { EventBus } from "./EventBus";
import { filter } from "rxjs";
import { DisplayTarget } from "../Hardware/MK3Controller";

type StackableWidget = {
    widgetId: string,
    widget: Widget<unknown>,
    layerIndex: number,
    displayTarget: DisplayTarget
};

@singleton()
export class WidgetManager {
    UI: UIController = container.resolve(UIController);
    ebus: EventBus = container.resolve(EventBus);
    widgets: StackableWidget[] = [];
    // FIFO widgetStack - contains the active widgets 
    widgetStack: StackableWidget[] = [];

    public get activeWidget(): StackableWidget {
        return this.widgetStack[this.widgetStack.length - 1];
    }    

    constructor() {
        this.ebus.events.pipe(filter(ev => ev.type === 'WidgetEvent')).subscribe(ev => {                    
            // we need to figure out the stack stuff, we have 2 displays (maybe 3?) we need to fix this
            // but for now!
            const w = this.getWidget({discriminator: ev.data.widgetName});
            w.displayTarget = ev.data.targetDisplay;
            this.showWidget(w);
        });
    }    

    unregisterWidget(widgetId: string) {
        this.widgets = this.widgets.filter(w => w.widgetId !== widgetId)
    }

    registerWidget(w: Widget<unknown>, allowDuplicate?: boolean): string {
        if(!allowDuplicate) {
            // check if discriminator is already present in the widgets list
            const existing = this.widgets.find(ew => ew.widget.discriminator === w.discriminator);
            if(existing) {
                throw new Error("Widget " + w.discriminator + " is already registered and duplicates are not allowed");
            }
        }

        const sW: StackableWidget = {
            widget: w,
            widgetId: crypto.randomUUID(),
            layerIndex: -1,
            displayTarget: 0 // default to left device display
        }

        this.widgets.push(sW);
        return sW.widgetId;
    }

    getWidget(opts: {
        widgetId?: string,
        discriminator?: string
    }) {
        if(opts.widgetId) {
            const w = this.widgets.find(w => w.widgetId === opts.widgetId);
            if(!w) throw new Error("NO WIDGET WIDTH ID: " + opts.widgetId);
            return w;
        } else if(opts.discriminator) {
            const w = this.widgets.find(w => w.widget.discriminator === opts.discriminator);
            if(!w) throw new Error("NO WIDGET WIDTH DISCRIMINATOR: " + opts.discriminator);
            return w;
        } else {
            throw new Error("WidgetManager: NO OPTS PROVIDED FOR GET");
        }
    }    
    showWidget(stackableWidget: StackableWidget) {
        const widget = stackableWidget;
        widget.displayTarget = stackableWidget.displayTarget;        
        this.widgetStack.push(widget);
        console.log('widgetStack', this.getWidgetStackByTarget(widget.displayTarget).map(w => w.widget.discriminator));        
        if(widget.widget.activate) {
            widget.widget.activate();
        }
        this.UI.sendWidget(widget.widget, widget.displayTarget);
    }
    closeWidget() {        
        console.log('close da widget');
        
        if(this.widgetStack.length > 0) {
            const nextWidget = this.widgetStack[this.widgetStack.length - 1];
            this.showWidget(nextWidget);
        }
    }

    private getWidgetStackByTarget(displayTarget: DisplayTarget) {
        return this.widgetStack.filter(ws => ws.displayTarget === displayTarget);
    }
}