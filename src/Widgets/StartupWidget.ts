import { Canvas, CanvasRenderingContext2D } from "canvas";
import { Widget, WidgetOptionButton } from "./Widget";
import { Project } from "../Core/Project";

export class StartupWidget extends Widget<unknown> {    
    static readonly discriminator: string = 'StartupWidget';
    currentPageIndex = 0;        

    options = [
        {
            button: this.targetDisplay === 'right' ? WidgetOptionButton.d5 : WidgetOptionButton.d1,
            label: 'New Project',
            handler: (state?: 'pressed' | 'released') => {
                if(state === 'pressed') {
                    //const project = new Project();
                    //this.daw.setProject(project);                    
                    console.log('New Project Was Pressed!');
                } else {
                    console.log('Proj Released');
                }
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

    constructor() {
        super({
            discriminator: StartupWidget.discriminator
        });
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