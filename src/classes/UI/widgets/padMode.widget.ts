import { UIController } from "../UIController";
import { Widget, WidgetConfig } from "./widget";

export class PadModeWidgetRight extends Widget {

    draw(cb?: (() => void) | undefined) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);        

        this.ctx.fillStyle = 'white';
        this.ctx.fillText("PadMode Right", 10, 10);

    }
    result() {
        throw new Error("Method not implemented.");
    }

}

export class PadModeWidgetLeft extends Widget {

    drawCB?: () => void;

    constructor(config: WidgetConfig) {
        super(config);
        this.draw();
    }

    draw(cb?: (() => void) | undefined) {

        if(cb) {
            this.drawCB = cb;
        }

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);        

        this.ctx.fillStyle = 'white';
        this.ctx.fillText("PadMode Left", 10, 10);        
    }
    result() {
        throw new Error("Method not implemented.");
    }
}