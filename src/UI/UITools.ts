import { CanvasRenderingContext2D } from "canvas";
import { Graphics, Text, Container, DisplayObject, Application, Assets, Texture, Sprite, TextStyle } from "@pixi/node";
import { UIKnob, UIOption } from "./PIXIUIController";
import { WidgetOption } from "../Widgets/PixiWidget";
import { AnalyserNode, AudioBuffer } from "node-web-audio-api";
import * as fs from 'fs';
import * as path from 'path';

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

type ListItem = {
    label: Text,
    bg: Graphics
}


interface RgbColor {
    r: number;
    g: number;
    b: number;
  }
  
  function hexToRgb(hex: string, arr?: boolean): RgbColor {
    // Remove the hash symbol if it exists
    hex = hex.replace('#', '');
  
    // Handle shorthand hex (e.g., #fff)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
  
    // Validate hex string length
    if (hex.length !== 6) {
      throw new Error('Invalid hex color string. Must be 6 characters long.');
    }
  
    // Extract red, green, and blue components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }
  

export class UITools {    

    public static Hex2RGB(hexString: string) {
        return hexToRgb(hexString);
    }

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

    public static DrawTextOld(ctx: CanvasRenderingContext2D, opts: TextOptions): void {
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

    public static DrawText(label: string, style: Partial<TextStyle>) {
        const text = new Text(label, style);
        return text;
    }

    public static DrawMenu(options: WidgetOption[]) {
        const menuContainer = new Container();
        options.sort((a,b) => a.ui.slot - b.ui.slot).some(opt => {      
            if(opt.toggleable) {
                opt.ui.toggleable = true;
                opt.ui.activeColor = opt.toggleable.activeColor;
            }            
            const cmp = this.GenerateOption(opt.ui);
            cmp.opt.x = (opt.ui.slot) * UIConstants.option.width;
            cmp.active.x = (opt.ui.slot) * UIConstants.option.width;
            menuContainer.addChild(cmp.opt);
            menuContainer.addChild(cmp.active);
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

    public static DrawListPicker2<T>(options: 
        {
            items: T[],
            labelKey?: keyof T,
            pagination?: boolean,
            itemsPrPage?: number

        }) {

        let selected: T | null;
        let activeItem: ListItem;
        const graphics = new Graphics();
        const listItems: ListItem[] = [];

        const setActive = (idx: number) => {
            // deactivate currently active item
            if(activeItem) {
                activeItem.bg.clear().beginFill(0x000000).drawRect(0, 0, 480, 20).endFill();                    
                activeItem.label.style.fill = 0xFFFFFF;
            }

            activeItem = listItems[idx];
            // mark the new active item
            activeItem.bg.clear().beginFill(0xFFFFFF).drawRect(0, 0, 480, 20).endFill();
            activeItem.label.style.fill = 0x000000;
        }            

        for(let i = 0; i < options.items.length; i++) {
            const item = options.items[i];                        
            const background = new Graphics();
            background.beginFill(0xFFFFFF);
            background.y += i * 20;
            
            const labelText = (options.labelKey ? item[options.labelKey] : item) as string;
            const itemLabel = new Text(labelText, {
                fill: 0xFFFFFF,
                fontSize: 16
            });
            itemLabel.anchor.set(0, .5);
            itemLabel.y += (i * 20) + 10;
            itemLabel.x += 10;

            graphics.addChild(background, itemLabel);

            listItems.push({
                label: itemLabel,
                bg: background
            });
        }

        return {
            graphics,
            setActive
        }
    }


    public static DrawListPicker<T>(options: {
        items: T[];
        labelKey?: keyof T;
        pagination?: boolean;
        itemsPerPage?: number;
      }) {
        // Pagination variables
        let currentPage = 1;
        const itemsPerPage = options.itemsPerPage || 10; // Default to 10 items per page
        let internalCurrentIndex = 0; // Track internal index
      
        let selected: T | null;
        let activeItem: ListItem | null = null; // Initialize with null
        const graphics = new Graphics();
        const allListItems: ListItem[] = []; // Store all list items for consistent indexing
        const listItems: ListItem[] = [];

        const setActive = (idx: number) => {
          // Deactivate currently active item
          if (activeItem) {
            activeItem.bg.clear().beginFill(0x000000).drawRect(0, 0, 480, 20).endFill();
            activeItem.label.style.fill = 0xffffff;
          }
      
          // Calculate actual index based on pagination
          const actualIndex = (currentPage - 1) * itemsPerPage + idx; 
          internalCurrentIndex = actualIndex;
      
          // Check if the selected item is outside the current page
          if (actualIndex < (currentPage - 1) * itemsPerPage || actualIndex >= currentPage * itemsPerPage) {
            // Calculate the target page
            const targetPage = Math.ceil((actualIndex + 1) / itemsPerPage); 
            currentPage = targetPage;
            drawCurrentPage(); 
          } else {
            // Mark the new active item within the current page
            activeItem = allListItems[actualIndex]; // Directly reference from allListItems
            activeItem.bg.clear().beginFill(0xffffff).drawRect(0, 0, 480, 20).endFill();
            activeItem.label.style.fill = 0x000000;
          }
        };
      
        const drawCurrentPage = () => {
          graphics.removeChildren(); 
          listItems.length = 0; // Clear only the visible listItems
      
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, options.items.length);
      
          for (let i = startIndex; i < endIndex; i++) {
            listItems.push(allListItems[i]); // Reference existing items from allListItems
            graphics.addChild(allListItems[i].bg, allListItems[i].label);
          }
      
          // Update activeItem if it's now within the visible range 
          // and it wasn't previously active
          if (activeItem === null && 
              internalCurrentIndex >= startIndex && 
              internalCurrentIndex < endIndex) {
            const visibleIndex = internalCurrentIndex - startIndex;
            activeItem = listItems[visibleIndex]; 
            activeItem.bg.clear().beginFill(0xffffff).drawRect(0, 0, 480, 20).endFill();
            activeItem.label.style.fill = 0x000000;
          }
        };
      
        if (options.pagination) {
          for (let i = 0; i < options.items.length; i++) {
            const item = options.items[i];
            const background = new Graphics();
            background.beginFill(0xffffff); 
      
            const labelText = (options.labelKey ? item[options.labelKey] : item) as string;
            const itemLabel = new Text(labelText, {
              fill: 0xffffff,
              fontSize: 16,
            });
            itemLabel.anchor.set(0, 0.5);
      
            allListItems.push({
              label: itemLabel,
              bg: background,
            });
          }
          drawCurrentPage(); // Draw initial page
        } else {
          // Draw entire list if pagination is disabled
          for (let i = 0; i < options.items.length; i++) {
            const item = options.items[i];
            const background = new Graphics();
            background.beginFill(0xffffff);
            background.y += i * 20;
      
            const labelText = (options.labelKey ? item[options.labelKey] : item) as string;
            const itemLabel = new Text(labelText, {
              fill: 0xffffff,
              fontSize: 16,
            });
            itemLabel.anchor.set(0, 0.5);
            itemLabel.y += (i * 20) + 10;
            itemLabel.x += 10;
      
            graphics.addChild(background, itemLabel);
      
            allListItems.push({
              label: itemLabel,
              bg: background,
            });
          }
        }
      
        return {
          graphics,
          setActive,
          nextPage: () => {
            if (currentPage < Math.ceil(options.items.length / itemsPerPage)) {
              currentPage++;
              drawCurrentPage();
            }
          },
          previousPage: () => {
            if (currentPage > 1) {
              currentPage--;
              drawCurrentPage();
            }
          },
          getCurrentIndex: () => {
            return internalCurrentIndex; 
          },
        };
      }

    public static DrawAnalyzerWave(analyser: AnalyserNode, width: number, height: number, ): {graphics: Graphics, update: () => void} {
        const graphics = new Graphics();        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
      
        graphics.lineStyle(1, 0xFFFFFF);
        graphics.moveTo(0, height / 2);
      
        const step = width / bufferLength;
      
        function updateWaveform() {          
          analyser.getByteTimeDomainData(dataArray);            
          graphics.clear();
          graphics.lineStyle(1, 0xFFFFFF);
          graphics.moveTo(0, height / 2);
      
          for (let i = 0; i < bufferLength; i++) {
            const y = height / 2 + (dataArray[i] - 128) * (height / 256);
            graphics.lineTo(i * step, y);
          }
        }
      
        return {
          graphics,
          update: updateWaveform,
        };
    }

    public static Icons: Map<string, Sprite> = new Map();

    public static async LoadUIAssets() {
        const iconPath = path.join(process.cwd(), 'data', 'images', 'icons');
        // read out the list of icons
        const icons = fs.readdirSync(iconPath);

        for(let i of icons) {
            UITools.Icons.set(i.split('.')[0], Sprite.from(await Assets.load(path.join(iconPath, i))));
        }
    }

    static renderInterval: number = 1000 / 25;
    static shouldRender = true;
    static waveformGfx = new Graphics();
    private static lastWaveformRenderTime = 0;
    private static dataArray?: Uint8Array;
    private static analyser?: AnalyserNode;

    public static DrawAnalyzer(app: Application, analyser?: AnalyserNode) {

        if(analyser) {
            this.analyser = analyser;            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        }        

        if(this.analyser && this.dataArray) {
            const now = performance.now();
            if (now - this.lastWaveformRenderTime >= UITools.renderInterval) {
                this.lastWaveformRenderTime = now;
    
                this.analyser.getByteTimeDomainData(this.dataArray);
    
                this.waveformGfx.clear();
                this.waveformGfx.lineStyle(2, 0xFFFFFF);
                this.waveformGfx.moveTo(0, 100);
    
                for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                const value = this.dataArray[i];
                const x = i * (800 / this.analyser.frequencyBinCount);
                const y = 100 + value;
                this.waveformGfx.lineTo(x, y);
                }
    
                if(this.shouldRender) {
                    app.renderer.render(app.stage);
                }
            }
    
            if(analyser) {
                requestAnimationFrame(() => this.DrawAnalyzer(app));
                return this.waveformGfx;
            } else {
                requestAnimationFrame(() => this.DrawAnalyzer(app));                
                return;
            }            
        }
        return;
    }

    public static DrawWaveform(audioBuffer: AudioBuffer, color: string = '0xFFFFFF', lineWidth: number = 2): Graphics {
        const graphics = new Graphics();
        const channelData = audioBuffer.getChannelData(0); // Get data from the first channel
        const numSamples = audioBuffer.length;
        const width = 480; // Adjust width as needed
        const height = 272; // Adjust height as needed
        const centerY = height / 2;

        const sampleWidth = width / numSamples;

        graphics.lineStyle(lineWidth, color);
        graphics.moveTo(0, centerY); 

        for (let i = 0; i < numSamples; i++) {
            const sample = channelData[i];
            const x = i * sampleWidth;
            const y = centerY - (sample * centerY * 0.8); // Scale amplitude 
            graphics.lineTo(x, y);
        }

        return graphics;
    }

    public static DrawOption(option: UIOption) {        
        const gfx = new Graphics();
        gfx.width = UIConstants.option.width;
        gfx.height = UIConstants.option.height;

        const isActive = option.active ? 'Active' : '';
        //const bgFill = option.toggleable ? option.activeColor : UIConstants.option.colors[`bg${ isActive }`];
        //const labelColor = UIConstants.option.colors[`label${ isActive }`];


        let bg: string = '#000000';
        let labelColor: string = '#ffffff'
        /*

        if(option.active) {
            if(option.toggleable) {
                bg = option.activeColor ?? UIConstants.option.colors.bgActive;
            } else {
                bg = UIConstants.option.colors.bgActive;
            }            
        }*/
        
        
        gfx.lineStyle(2, '#ffffff', 1);
        gfx.beginFill(bg);
        gfx.drawRect(0, 0, UIConstants.option.width, UIConstants.option.height);
        gfx.endFill();

        // draw option box
        if(option.toggleable) {
            gfx.lineStyle(1, '#ffffff', 1);

            if(option.active) {
                gfx.beginFill(option.activeColor);
            } else {
                gfx.beginFill(bg);
            }

            gfx.drawRect(15, 35 / 2 - 5, 10, 10);
            gfx.endFill();
        }

        const label = new Text(option.label, {
            fill: UITools.isLight(bg) ? '#000000' : '#ffffff',
            fontSize: 12
        });
        label.anchor.set(.5, .5);
        label.x = gfx.width / 2 + (option.toggleable ? 5 : 0);
        label.y = gfx.height / 2 - 1;
        gfx.addChild(label);
        return gfx;
    }

    public static GenerateOption(option: UIOption) {
        const opt = new Graphics();
        opt.width = UIConstants.option.width;
        opt.height = UIConstants.option.height;
        opt.lineStyle(2, 0xFFFFFF, 1);
        opt.beginFill(0x000000);
        opt.drawRect(0, 0, UIConstants.option.width, UIConstants.option.height);
        opt.endFill();        

        // if toggleable, add a small box next to the label
        if(option.toggleable) {
            opt.lineStyle(1, 0xFFFFFF, 1);
            opt.beginFill(0x000000);
            opt.drawRect(15, 35 / 2 - 5, 10, 10);
            opt.endFill();
        }

        const defaultLabel = new Text(option.label, {
            fill: 0xFFFFFF,
            fontSize: 12
        });
        defaultLabel.anchor.set(.5, .5);
        defaultLabel.position.set(opt.width / 2, opt.height / 2);

        if(option.toggleable) 
            defaultLabel.x += 5;

        opt.addChild(defaultLabel);
        opt.cacheAsBitmap = true;
        opt.renderable = true;
        opt.name = option.slot + '_opt';

        // active stuff
        const active = new Graphics();
        active.width = UIConstants.option.width;
        active.height = UIConstants.option.height;        

        active.lineStyle(2, 0xFFFFFF, 1);
        active.beginFill(option.toggleable ? 0x000000 : 0xFFFFFF);
        active.drawRect(0, 0, UIConstants.option.width, UIConstants.option.height);
        active.endFill();        
        
        // if toggleable, add a small box next to the label
        if(option.toggleable) {
            active.lineStyle(1, 0xFFFFFF, 1);
            active.beginFill(option.activeColor ?? 0xFFFFFF);
            active.drawRect(15, 35 / 2 - 5, 10, 10);
            active.endFill();
        }

        const activeLabel = new Text(option.label, {
            fill: option.toggleable ? 0xFFFFFF : 0x000000,
            fontSize: 12
        });
        activeLabel.anchor.set(.5, .5);
        activeLabel.position.set(opt.width / 2, opt.height / 2);

        if(option.toggleable) 
            activeLabel.x += 5;

        active.addChild(activeLabel);
        active.cacheAsBitmap = true;
        active.renderable = false;
        active.name = option.slot + '_active';

        return {
            opt: opt,
            active: active
        }        
    }

    public static DrawTitlebar(titlebar: {
        color?: string;
        title: string;
        icon?: string;
    }): DisplayObject {

        const graphics = new Graphics();
        graphics.beginFill(titlebar.color ?? '#ffffff')
            .drawRect(0, 0, 35, 35)
            .endFill()
            .beginFill('#1e1d1f')
            .drawRect(35, 0, 480 - 35, 35)
            .endFill();        

        const title = new Text(titlebar.title, {
            fill: '#ffffff',
            fontSize: 16
        });
        title.x = 45;
        title.anchor.set(0, .5);
        title.y = 35 / 2;
        graphics.addChild(title);

        if(titlebar.icon) {
            console.log('we should load our icon right here!');
            const ico = UITools.Icons.get(titlebar.icon);
            if(ico) {

                // we have to scale the icon, so - lets get it to 30px

                // get the ratio
                const wRatio = 30 / ico.width;                
                ico.scale.set(wRatio, wRatio);

                ico.anchor.set(.5, .5);
                ico.position.set(35 / 2, 35 / 2);
                graphics.addChild(ico);
            }
        }

        return graphics;
    }

    public static isLight(color: string) { //<--color in the way '#RRGGBB
        if (color.length ==  7) {
          const rgb = [
            parseInt(color.substring(1, 3), 16),
            parseInt(color.substring(3, 5), 16),
            parseInt(color.substring(5), 16),
          ];
          const luminance =
            (0.2126 * rgb[0]) / 255 +
            (0.7152 * rgb[1]) / 255 +
            (0.0722 * rgb[2]) / 255;
          return luminance > 0.5;
        }
        return false
      }
}

export const UIConstants = {
    option: {
        width: (480 / 4) - 1,
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
