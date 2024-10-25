import { CanvasRenderingContext2D } from "canvas";
import { Graphics, Text, Container } from "@pixi/node";
import { UIKnob, UIOption } from "./PIXIUIController";

type Position = {
    x: number,
    y: number
}

type ModalOptions = {
    height: number,
    width: number,
    title?: string,
    dismissable?: boolean // TODO: expand on modal system to enable modal results, dismissables, etc...
};

type TextOptions = {
    text: string,
    position: Position,
    maxWidth?: number
}

type PadDrawingOptions = {
    pads: Pad[],
    position?: Position,
    height?: number,
    width?: number
}

export type Pad = {
    name: string,
    active: boolean
}


export class UITools {    

    public static DrawModal(ctx: CanvasRenderingContext2D, opts: ModalOptions): void {        

        const origFillstyle = ctx.fillStyle;
        const origStrokeStyle = ctx.strokeStyle;

        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, opts.width, opts.height);

        // draw a nice box
        ctx.strokeStyle = 'white';
        ctx.strokeRect(10, 10, opts.width - 20, opts.height - 20);

        // title
        ctx.fillStyle = 'white';
        if(opts.title) {
            const tAlign = ctx.textAlign;
            ctx.textAlign = 'center';
            ctx.fillText(opts.title, opts.width / 2, 25);
            ctx.textAlign = tAlign;
        }
        if(opts.title) {
            ctx.beginPath();
            ctx.moveTo(10, 35);
            ctx.lineTo(opts.width - 10, 35);
            ctx.closePath();
            ctx.stroke();
        } else {
            ctx.fillRect(10, 10, opts.width - 20, 25);
        }

        ctx.fillStyle = origFillstyle;
        ctx.strokeStyle = origStrokeStyle;
    }

    public static DrawText(ctx: CanvasRenderingContext2D, opts: TextOptions): void {
        const origFillstyle = ctx.fillStyle;            
        ctx.fillStyle = 'white';

        const formatted = opts.text.split('\n');
        let offset = 0;
            let lineHeight = 15;
            
        formatted.forEach((l, idx) => {
            if(l === '' && idx === 0) {
                return;
            }

            ctx.fillText(l.trim(), opts.position.x, opts.position.y + offset);
            offset += lineHeight;            
        });

        ctx.fillStyle = origFillstyle;
    }

    public static DrawPads(ctx: CanvasRenderingContext2D, opts: PadDrawingOptions) {
        const x = opts.position?.x ?? 0, y = opts.position?.y ?? 0;
        const height = (opts.height ?? ctx.canvas.height) - y;
        const width = (opts.width ?? ctx.canvas.width) - (x*2); // margin

        console.log('Drawing Pads', x, y, height, width);
        
        // List of pad names
        const pads = opts.pads

        // Number of columns and rows in the grid
        const cols = 4;
        const rows = 4;

        const padding = 0;
        const padWidth = width / 4;
        const padHeight = height / 4;

        // Calculate total grid width and height, including internal padding between cells
        const totalGridWidth = (cols * padWidth) + ((cols + 1) * padding);  // Include padding on the edges
        const totalGridHeight = (rows * padHeight) + ((rows + 1) * padding); // Include padding on the edges

        // Calculate offset to center the grid in the canvas with respect to the edge padding
        const offsetX = (ctx.canvas.width - totalGridWidth) / 2;
        const offsetY = (ctx.canvas.height - totalGridHeight) / 2;

        const strokeStyle = ctx.strokeStyle;
        const fillStyle = ctx.fillStyle;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        // Loop through the pads and draw each as a rectangle
        pads.forEach((pad, index) => {
            const col = index % cols; // Column position
            const row = Math.floor(index / cols); // Row position

            const x = offsetX + padding + col * (padWidth + padding); // X coordinate, respect padding
            const y = offsetY + padding + row * (padHeight + padding); // Y coordinate, respect padding

            // Draw the pad as a stroked rectangle
            ctx.strokeRect(x, y, padWidth, padHeight);

            if(pad.active) {
                console.log('this pad is active', pad);
                ctx.fillStyle = 'white';
                ctx.fillRect(x, y, padWidth, padHeight);
            }

            // Optionally, add the pad label in the center of the rectangle
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `${Math.min(padWidth, padHeight) / 5}px Arial`;

            ctx.fillStyle = pad.active ? 'black' : 'white';

            ctx.fillText(pad.name, x + padWidth / 2, y + padHeight / 2);
        });

        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
    }    

    public static ExtractRegion(
        x: number, 
        y: number, 
        w: number, 
        h: number, 
        arr: Uint8Array, 
        imageWidth: number, 
        returnRGBA: boolean = false
    ): Uint8Array {
        const bytesPerPixel = 4; // RGBA8888 has 4 bytes per pixel
        const regionRGBA = new Uint8Array(w * h * bytesPerPixel); // Create an array to hold the RGBA region
    
        for (let row = 0; row < h; row++) {
            const sourceStart = ((y + row) * imageWidth + x) * bytesPerPixel; // Start of the row in the source array
            const sourceEnd = sourceStart + w * bytesPerPixel; // End of the row in the source array
            const destinationStart = row * w * bytesPerPixel; // Start of the row in the destination array
            regionRGBA.set(arr.slice(sourceStart, sourceEnd), destinationStart); // Copy row to destination
        }
    
        if (returnRGBA) {
            return regionRGBA; // Return RGBA data (including alpha)
        }
    
        // Convert RGBA to RGB (strip alpha channel for JPEG)
        const regionRGB = new Uint8Array(w * h * 3); // RGB array (3 bytes per pixel)
        for (let i = 0, j = 0; i < regionRGBA.length; i += 4, j += 3) {
            regionRGB[j] = regionRGBA[i];     // Red
            regionRGB[j + 1] = regionRGBA[i + 1]; // Green
            regionRGB[j + 2] = regionRGBA[i + 2]; // Blue
            // Alpha (regionRGBA[i + 3]) is ignored
        }
    
        return regionRGB; // Return RGB data (without alpha) suitable for JPEG
    }

    public static convertToRGB(regionRGBA: Uint8Array, w: number, h: number) {
         // Convert RGBA to RGB (strip alpha channel for JPEG)
         const regionRGB = new Uint8Array(w * h * 3); // RGB array (3 bytes per pixel)
         for (let i = 0, j = 0; i < regionRGBA.length; i += 4, j += 3) {
             regionRGB[j] = regionRGBA[i];     // Red
             regionRGB[j + 1] = regionRGBA[i + 1]; // Green
             regionRGB[j + 2] = regionRGBA[i + 2]; // Blue
             // Alpha (regionRGBA[i + 3]) is ignored
         }
         return regionRGB;
    }

    public static DrawMenu(options: UIOption[]) {
        const menuContainer = new Container();
        options.sort((a,b) => a.slot - b.slot).some(opt => {            
            const cmp = this.DrawOption(opt);
            cmp.x = (opt.slot) * UIConstants.option.width;            
            menuContainer.addChild(cmp);
        });
        return menuContainer;
    }

    public static DrawKnobs(knobs: UIKnob[]) {
        const knobContainer = new Container();
        knobs.sort((a,b,) => a.slot - b.slot).some(k => {
            const cmp = this.DrawKnob(k);
            cmp.x = (k.slot) * UIConstants.knob.width;            
            knobContainer.addChild(cmp);
        });
        return knobContainer;        
    }
    
    public static DrawKnob(k: UIKnob) {                
        const gfx = new Graphics();                
        gfx.width = UIConstants.knob.width;
        gfx.height = UIConstants.knob.height;
        
        gfx.lineStyle(2, '#ffffff', 1)
            .beginFill('#000000', 1)
            .drawCircle(gfx.width / 2, gfx.height / 2, 25).endFill();                    
        return gfx;
    }

    public static DrawOption(option: UIOption) {        
        const gfx = new Graphics();
        gfx.width = UIConstants.option.width;
        gfx.height = UIConstants.option.height;

        const isActive = option.active ? 'Active' : '';
        const bgFill = UIConstants.option.colors[`bg${ isActive }`];
        const labelColor = UIConstants.option.colors[`label${ isActive }`];
        
        gfx.lineStyle(2, '#ffffff', 1);
        gfx.beginFill(bgFill);
        gfx.drawRect(0, 0, UIConstants.option.width, UIConstants.option.height);
        gfx.endFill();

        const label = new Text(option.label, {
            fill: labelColor,
            fontSize: 12
        });
        label.anchor.set(.5, .5);
        label.x = gfx.width / 2;
        label.y = gfx.height / 2;
        gfx.addChild(label);
        return gfx;
    }
}

export const UIConstants = {
    option: {
        width: 480 / 4,
        height: 35,
        colors: {
            bg: '#000000',
            bgActive: '#ffffff',
            label: '#ffffff',
            labelActive: '#000000'
        }
    },
    knob: {
        width: 480 / 4,
        height: 35
    },
    LED: {
        defaultBrightness: 127 / 2,
        maxBrightness: 127        
    }

}
