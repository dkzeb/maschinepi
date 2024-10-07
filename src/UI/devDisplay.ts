import { Display, DisplayType, TextOptions } from "./display";
import { loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { DisplayTarget } from "src/Hardware/MK3Controller";

const devDisplayPath = path.join(process.cwd(), "/.maschinepi/devdisplays/");

export class DevDisplay extends Display {    

    destination: string;

    constructor(name: string, displayTarget: DisplayTarget, destination: string) {
        super({
            name: name,
            width: 480,
            height: 272,
            type: DisplayType.DEVDisplay,
            displayTarget
        });        
        this.destination = destination;
        this.ctx = this.cvs.getContext("2d");
    }

    override sendImage(data: Buffer) {                
        loadImage(data).then(img => {        
            this.drawRoutine = () => {                                            
                this.ctx?.drawImage(img, 0, 0);           
                this.writeToLocalFile();
            }
            this.draw();  
        });        
    }

    override draw(): void {
        super.draw();        
        const data = this.cvs.toDataURL('image/png').split('base64,')[1];        
        fs.writeFileSync(path.join(devDisplayPath, this.destination), data);
    }

    override sendText(opts: TextOptions) {        
        if(this.ctx) {                            
            this.drawRoutine = () => {
                const fillStyle = this.ctx!.fillStyle;
                this.clear();
                this.ctx!.fillStyle = 'white';
                this.ctx!.fillText(opts.text, opts.position?.x ?? 10, opts.position?.y ?? 10, this.options.width - (opts.position?.x ?? 10));                
                this.ctx!.fillStyle = fillStyle;
            }
        } else {
            console.warn("No this.ctx for display", this.options.name);
        } 

        this.draw();
    }

    private writeToLocalFile() {
        const b64 = this.cvs.toDataURL().split("base64,")[1];
        fs.writeFileSync(path.join(process.cwd(), '.maschinepi', 'devdisplays', this.destination), b64);        
    }

}