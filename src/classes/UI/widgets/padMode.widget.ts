import { UIController } from "../UIController";
import { Widget, WidgetConfig } from "./widget";


// right widget is the pad overview, and idk, maybe tempo or something like that? 
export class PadModeWidgetRight extends Widget {

    drawCB?: () => void;

    constructor(config: WidgetConfig) {
        super(config);
        this.draw();
    }

    draw(cb?: (() => void) | undefined) {

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();

        // calc correct width
        const rectWidth = this.width / 4;
        // let the pad spacing take up 2/3rd of the screen
        const rectHeight = (this.height * .77) / 4;
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                this.ctx.strokeRect(rectWidth * i, 60 + rectHeight * j, rectWidth, rectHeight);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();

        if(this.drawCB) {
            this.drawCB();
        }
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

        if(!this.drawCB && cb) {
            this.drawCB = cb;
        }

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);        

        this.ctx.fillStyle = 'white';
        this.ctx.fillText("PadMode Left", 10, 10);        

        if(this.drawCB) {
            this.drawCB();
        }
    }
    result() {
        throw new Error("Method not implemented.");
    }
}