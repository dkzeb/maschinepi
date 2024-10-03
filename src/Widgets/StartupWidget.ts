import { Canvas, CanvasRenderingContext2D } from "canvas";
import { EventBus } from "src/Core/EventBus";
import { UIControl } from "src/UI/uiControl";
import { Widget } from "./widget";
import * as os from 'os';

type WidgetPage = {};

export class StartupWidget implements Widget {
    canvas!: Canvas;
    ctx!: CanvasRenderingContext2D;
    controls!: UIControl[];
    children?: Widget[] | undefined;
    ebus!: EventBus;    

    currentPageIndex = 0;
    pages: WidgetPage[] = [];

    render(): void {       
        const page = this.pages[this.currentPageIndex];
        // do something with the page here

        const info = this.getInfo();
        console.dir(info);

    }    

    getInfo() {
        const info = {
            os: os.platform(),
            freeMem: os.freemem(),
            totalMem: os.totalmem(),
            cpu: os.cpus(),
            network: os.networkInterfaces(),
            user: os.userInfo()
        }

        return info;
    }
}