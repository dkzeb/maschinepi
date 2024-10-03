import { CanvasRenderingContext2D } from "canvas";

export abstract class UIControl { 
    abstract drawGUI(ctx: CanvasRenderingContext2D): void;
}