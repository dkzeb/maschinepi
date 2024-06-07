import { Widget, WidgetConfig } from "./widget";


// right widget is the pad overview, and idk, maybe tempo or something like that? 
export class PadModeWidgetRight extends Widget {
    isModeRootWidget: boolean = true;    
    activePad?: string = '';
    constructor(config: WidgetConfig) {
        super(config);
        this.draw();
    }

    setup() {        
    }

    draw() {
        const origFill = this.ctx.fillStyle;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();

        // calc correct width
        const rectWidth = this.width / 4;
        // let the pad spacing take up 2/3rd of the screen
        const rectHeight = (this.height * .77) / 4;

        let activeI, activeJ;
        if(this.activePad) {
            activeI = padMap[this.activePad][0];
            activeJ = padMap[this.activePad][1];
        }

        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.activePad && i === activeI && j === activeJ) {
                    const origFill = this.ctx.fillStyle;
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(rectWidth * i, 60 + rectHeight * j, rectWidth, rectHeight);
                    this.ctx.fillStyle = origFill;
                } else {
                    this.ctx.strokeRect(rectWidth * i, 60  + rectHeight * j, rectWidth, rectHeight);
                }
            }
        }        

        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fillStyle = origFill;
    }
}

export class PadModeWidgetLeft extends Widget {

    isModeRootWidget: boolean = true;    
    constructor(config: WidgetConfig) {
        super(config);        
    }
    
    setup() {        
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);        

        this.ctx.fillStyle = 'white';
        this.ctx.fillText("PadMode Left", 10, 10);
    }
}

const padMap = {
    p1: [0,0],
    p2: [1,0],
    p3: [2,0],
    p4: [3,0],
    p5: [0,1],
    p6: [1,1],
    p7: [2,1],
    p8: [3,1],
    p9: [0,2],
    p10: [1,2],
    p11: [2,2],
    p12: [3,2],
    p13: [0,3],
    p14: [1,3],
    p15: [2,3],
    p16: [3,3]
}