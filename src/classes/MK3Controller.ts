import { MaschineMk3 } from "ni-controllers-lib";
import jpeg from 'jpeg-js';
import { Canvas, CanvasRenderingContext2D, registerFont } from "canvas";
import path from 'node:path';
import pkg from '../../package.json';

export const PadColor = {    
    orange: 0,
    orangeLight: 1,
    orangeLighter: 2,
    yellow: 3,
    yellowLight: 4,
    greenLight: 5,
    green: 6,
    blue: 10,

}

export enum Mk3Display {
    "left",
    "right"
}

export class MK3GraphicsController {
    
    mk3: MaschineMk3;
    bufLeft: ArrayBuffer;
    bufRight: ArrayBuffer;

    ctx: CanvasRenderingContext2D;
    canvas: Canvas;

    constructor(mk3: MaschineMk3) {
        this.mk3 = mk3;             
        this.bufLeft = this.mk3.displays.createDisplayBuffer();
        this.bufRight = this.mk3.displays.createDisplayBuffer();

        process.env.PANGOCAIRO_BACKEND = 'fontconfig';
        // register graphik font
        const fontFolder = path.join(process.cwd(), 'assets', 'fonts');

        registerFont(require('@canvas-fonts/impact'), { family: "Impact" });        

        /*registerFont(path.join(fontFolder, 'graphik', 'GraphikRegular.otf'), {
            family: 'Graphik',
            weight: 'regular'
        });*/

        this.canvas = new Canvas(480, 272, 'image');        
        this.ctx = this.canvas.getContext('2d');        
    }

    writeText(text: string, display: Mk3Display, font?: string) {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, 480, 272);
        this.ctx.moveTo(10, 10);
        this.ctx.fillStyle = 'white';
        
        if(font) {
            this.ctx.font = font;
        } else {
            // default font stuff
            this.ctx.font = '20px "Impact"';
        }

        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, 240, 136); // middle of screen
        this.pushCanvas(display);
    }

    showVersion() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, 480, 272);
        this.ctx.moveTo(10, 10);
        this.ctx.fillStyle = 'white';
                
        this.ctx.font = '40px "Impact"';        
        this.ctx.textAlign = 'center';
        this.ctx.fillText("MASCHINEPI", 240, 116); // middle of screen
        this.ctx.font = '20px "Impact"';        
        this.ctx.fillText(`Version ${pkg.version}`, 240, 156); // middle of screen
        this.pushCanvas(Mk3Display.right);
    }

    buildMenu(
        options: {
            label: string;
            action: () => void
        }[]
    ) {
        // clear the top rect
        this.ctx.clearRect(0, 0, 480, 30);        
        // option width:
        const menuOptionWidth = 480 / 4;  
        
        options.forEach((opt, idx) => {
            this.ctx.rect(menuOptionWidth * idx, 0, menuOptionWidth, 30);
            this.ctx.font = '16px "Impact"';
            this.ctx.fillText(opt.label, (menuOptionWidth * idx) + (menuOptionWidth / 2) - 5, 16+2, menuOptionWidth);
        });
        this.pushCanvas(Mk3Display.left);
    }

    padIntro() {
        //  1  2  3  4
        //  5  6  7  8
        //  9 10 11 12
        // 13 14 15 16

        
        this.mk3.indexed_leds['p6'].setColorByNumberHelper(6, false, true);        
        setTimeout(() => {            
            this.mk3.indexed_leds['p7'].setColorByNumberHelper(6, false, true);        
        }, 200);
        
        setTimeout(() => {            
            this.mk3.indexed_leds['p11'].setColorByNumberHelper(15, false, true);                    
        }, 400);
        
        setTimeout(() => {                        
            this.mk3.indexed_leds['p10'].setColorByNumberHelper(15, false, true);        
        }, 600);

        setTimeout(() => {
            this.mk3.indexed_leds['p1'].setWhite(); //(6, false, true);        
            this.mk3.indexed_leds['p2'].setWhite();
            this.mk3.indexed_leds['p3'].setWhite();
            this.mk3.indexed_leds['p4'].setWhite();
            this.mk3.indexed_leds['p5'].setWhite();
            //this.mk3.indexed_leds['p6'].setColorByNumberHelper(6, false, true);        
            //this.mk3.indexed_leds['p7'].setColorByNumberHelper(6, false, true);        
            this.mk3.indexed_leds['p8'].setWhite();
            this.mk3.indexed_leds['p9'].setWhite();
            //this.mk3.indexed_leds['p10'].setColorByNumberHelper(6, false, true);        
            //this.mk3.indexed_leds['p11'].setColorByNumberHelper(6, false, true);        
            this.mk3.indexed_leds['p12'].setWhite();
            this.mk3.indexed_leds['p13'].setWhite();
            this.mk3.indexed_leds['p14'].setWhite();
            this.mk3.indexed_leds['p15'].setWhite();
            this.mk3.indexed_leds['p16'].setWhite();
        }, 800);
        
        setTimeout(() => {
            this.allPadsOff();
        }, 3500);

        return;

        for (let i = 1; i <= 16; i++) {
            const li = i;
            const li0 = li - 1;
            const name = `p${i}`;
            const led = this.mk3.indexed_leds[name];
            led.setColorByNumberHelper(li0, false, true);
            // note, could alternately do a single listen on "p:pressure", which passes
            // the index.
            this.mk3.on(`${name}:pressure`, (pressure) => {
              led.setColorByNumberHelper(
                li0,
                pressure > 2048,
                pressure % 2048 > 1024
              );
            });
          }
    }

    allPadsOff() {        
        this.mk3.indexed_leds['p1'].setOff();
        this.mk3.indexed_leds['p2'].setOff();
        this.mk3.indexed_leds['p3'].setOff();
        this.mk3.indexed_leds['p4'].setOff();
        this.mk3.indexed_leds['p5'].setOff();
        this.mk3.indexed_leds['p6'].setOff();
        this.mk3.indexed_leds['p7'].setOff();
        this.mk3.indexed_leds['p8'].setOff();
        this.mk3.indexed_leds['p9'].setOff();
        this.mk3.indexed_leds['p10'].setOff();
        this.mk3.indexed_leds['p11'].setOff();
        this.mk3.indexed_leds['p12'].setOff();
        this.mk3.indexed_leds['p13'].setOff();
        this.mk3.indexed_leds['p14'].setOff();
        this.mk3.indexed_leds['p15'].setOff();
        this.mk3.indexed_leds['p16'].setOff();        
    }

    animateClock() {
        console.log('starting animation test');
        const startX = 10, startY = 10;
        this.ctx.fillStyle = 'black';
        this.ctx.moveTo(startX, startY);        
        const ih = setInterval(() => {
            clock(this.canvas, this.ctx);
            this.pushCanvas(Mk3Display.right);
        }, 1000 / 30); // 30 fps
    }

    sendImage(imgData: Buffer, display: Mk3Display, skipParse?: boolean)
    sendImage(imgData: Uint8Array, display: Mk3Display)    
    sendImage(imgData: Uint8Array | Buffer, display: Mk3Display, skipParse = false) {
        if(Buffer.isBuffer(imgData) && !skipParse) {
            const decoded = jpeg.decode(imgData, { useTArray: true, formatAsRGBA: false });
            imgData = decoded.data;
        }
        this.mk3.displays.paintDisplay(display, imgData, display === Mk3Display.left ? this.bufLeft : this.bufRight);
    }    

    private pushCanvas(display: Mk3Display) {
        this.canvas.toBuffer((err, buff) => {
            this.sendImage(buff, display);
        }, 'image/jpeg', {
            quality: 1
        });
    }

}

function clock(canvas, ctx) {
    const now = new Date();    
    ctx.save();
    ctx.clearRect(0, 0, 150, 150);
    ctx.translate(75, 75);
    ctx.scale(0.4, 0.4);
    ctx.rotate(-Math.PI / 2);
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  
    // Hour marks
    ctx.save();
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate(Math.PI / 6);
      ctx.moveTo(100, 0);
      ctx.lineTo(120, 0);
      ctx.stroke();
    }
    ctx.restore();
  
    // Minute marks
    ctx.save();
    ctx.lineWidth = 5;
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        ctx.beginPath();
        ctx.moveTo(117, 0);
        ctx.lineTo(120, 0);
        ctx.stroke();
      }
      ctx.rotate(Math.PI / 30);
    }
    ctx.restore();
  
    //const sec = now.getSeconds();
    // To display a clock with a sweeping second hand, use:
     const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes();
    const hr = now.getHours() % 12;
  
    ctx.fillStyle = "black";
  
    // Write image description
    canvas.innerText = `The time is: ${hr}:${min}`;
  
    // Write Hours
    ctx.save();
    ctx.rotate(
      (Math.PI / 6) * hr + (Math.PI / 360) * min + (Math.PI / 21600) * sec,
    );
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();
    ctx.restore();
  
    // Write Minutes
    ctx.save();
    ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(112, 0);
    ctx.stroke();
    ctx.restore();
  
    // Write seconds
    ctx.save();
    ctx.rotate((sec * Math.PI) / 30);
    ctx.strokeStyle = "#D40000";
    ctx.fillStyle = "#D40000";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(83, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(95, 0, 10, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.fillStyle = "rgb(0 0 0 / 0%)";
    ctx.arc(0, 0, 3, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  
    ctx.beginPath();
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#325FA2";
    ctx.arc(0, 0, 142, 0, Math.PI * 2, true);
    ctx.stroke();
  
    ctx.restore();      
  }