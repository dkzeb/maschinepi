import { Canvas, CanvasRenderingContext2D } from "canvas";
import { Widget, WidgetOptionButton, WidgetOptions } from "./Widget";

export class StartupWidget extends Widget<unknown> {    
    discriminator: string = 'StartupWidget';
    currentPageIndex = 0;    

    options = [
        {
            button: this.targetDisplay === 'right' ? WidgetOptionButton.d5 : WidgetOptionButton.d1,
            label: 'New Project',
            handler: () => {
                console.log('New Project Was Pressed!');
            }
        },
        {
            button: this.targetDisplay === 'right' ? WidgetOptionButton.d6 : WidgetOptionButton.d2,
            label: 'Load Project',
            handler: () => {
                console.log('Load Project Was Pressed!');
            }
        },
    ]

    constructor(opts: WidgetOptions) {
        super(opts);
        this.canvas = new Canvas(480, 272, "image");
        this.ctx = this.canvas.getContext("2d");                        
    }
    
    async render(): Promise<string> {                        
        const hasMenu = this.options && this.options.length > 0;
        // render the widgets ui based on the current         
        const imgData = this.canvas?.toDataURL("image/jpeg") ?? "NO_DATA";
        if(imgData === 'NO_DATA') {
            throw new Error("WIDGET PRODUCED NO IMG DATA");
        }
        return imgData;
    }    

    drawLayout = (ctx: CanvasRenderingContext2D) => {
        this.drawMenu();
    };

    
}