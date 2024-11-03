import { Graphics, Text } from "@pixi/node";
import { PixiWidget, PixiWidgetOptions } from "./PixiWidget";
import { WidgetManager } from "../../UI/PIXIUIController";
import { container } from "tsyringe";
import { Subject } from "rxjs";

type ModalWidgetOptions<T> = PixiWidgetOptions & {
    result?: Subject<T>
}

export class ModalWidget<T> extends PixiWidget {

    mgr: WidgetManager = container.resolve(WidgetManager);
    opts: ModalWidgetOptions<T>;

    result: Subject<T> = new Subject();

    constructor(opts: ModalWidgetOptions<T>) {
        opts.dims = {
            x: 0, y: 0, w: 480, h: 282
        }
        super(opts);
        this.opts = opts;
        
    }

    resolve(res: T) {
        this.result.next(res);
        this.result.complete();

        this.mgr.removeWidget(this.opts.name);
    }

    override draw() {

        const bg = new Graphics()
                        .beginFill(0x000000)
                        .drawRect(10, 10, 480 - 10, 272 - 10)
                        .endFill();        
        
        const t = new Text("Pick a fucking sample son!", {
            fill: 0xFFFFFF,
            fontSize: 24
        });
        t.anchor.set(.5, .5);
        t.x = 480 / 2;
        t.y = 272 / 2;
        
        this.widgetUi.removeChildren();
        this.widgetUi.addChild(bg);
        this.widgetUi.addChild(t);

        return this.widgetUi;
    }
    
}