import { Canvas, CanvasRenderingContext2D } from "canvas";

export class UIController {

}


/**
 * A widget is a smaller ui element that basically runs like its entire program.
 * a widget can be almost anything, like a dialog/popup or a FileList
 */
export class Widget {
    ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }
}