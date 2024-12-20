import { PrismaClient, Sample } from "@prisma/client";
import { Widget, WidgetConfig, WidgetOption } from "./widget";
import { filter } from "rxjs";
import { EventBus } from "../../EventBus";
import { Mk3Display } from "../../MK3Controller";
import { SoundEngine } from "../../SoundEngine";
import { UIController } from "../UIController";
import { container } from "tsyringe";

export class SampleList extends Widget {    
    prisma: PrismaClient;
    files: Sample[] = [];
    highlighted: number = -1;
    title = 'Load Sample';
    previewEnabled: boolean = false;
    page = 1;
    maxLinesPrPage = 10;
    options: WidgetOption[] = [
        {
            label: 'Back',
            button: 'd1',
            action: (action) => {
                console.log('action',action);
                if(action) {
                    this.ebus.processEvent({
                        type: 'CloseWidget',
                        data: {
                            targetMK3Display: Mk3Display.both
                        }
                    })
                }
            }
        },
        {
            label: 'Live Preview',
            button: 'd4',
            action: (o: WidgetOption) => {
                this.previewEnabled = !this.previewEnabled;
                o.active = this.previewEnabled;                           
            }
        }
    ]
    ebus: EventBus;    
    soundEngine: SoundEngine;    

    constructor(config: WidgetConfig) {
        super(config);
        this.soundEngine = container.resolve(SoundEngine);
        this.prisma = new PrismaClient();
        this.ebus = container.resolve(EventBus);                
    }

    setup() {
        this.previewEnabled = false;
        const knobEv = this.ebus.events.pipe(filter(e => e.type === 'KnobInput' && e.name === 'navStep')).subscribe(e => {
            this.highlighted += e.data.direction ?? 0;                        
            this.page = this.highlighted > 0 ? Math.ceil((this.highlighted) / this.files.length * Math.ceil(this.files.length / this.maxLinesPrPage)) : 1;

            if(this.highlighted < 0) {
                this.highlighted = 0;
            } else {                
                this.update();
                if(this.previewEnabled) {
                    this.loadSampleDisplay();
                }
            }
        });

        this.widgetSubscriptions.push(knobEv);

        const navPress = this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && e.name === 'navPush:pressed')).subscribe(e => {            
            this.loadSampleDisplay();
        });
        this.widgetSubscriptions.push(navPress);        
    }

    loadSampleDisplay() {
        this.ebus.processEvent({
            type: 'LoadWidget',
            data: {
                widgetName: 'SampleDisplay',
                widgetData: {
                    sample: this.files[this.highlighted],
                    preview: this.previewEnabled
                },
                targetMK3Display: Mk3Display.right
            }
        });        
    }    

    result(): void {
    }

    resolve(): void {
        this.loadSampleDisplay();
    }

    async draw() {        
        if(this.highlighted < 0) {
            this.highlighted = 0;
        }

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);                

        this.ctx.font = "10px Impact";
        
        if(this.files.length === 0) {
            await this.listFiles();
        }

        const heightOffset = 35;
        
        this.paginate(this.files, this.maxLinesPrPage, this.page).forEach((f, i) => {
            if((i + 1) % this.maxLinesPrPage === this.highlighted) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(10, heightOffset + (20 * (i % 10)) + 20, this.width - 20, 20);
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(f.name, 20, heightOffset + 35 + ((i % 10) * 20));                
            } else {
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(f.name, 20, heightOffset + 35 + ((i % 10) * 20));
            }
        });              
    }

    private paginate(array, page_size, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }    

    getSelection() {
        return this.files[this.highlighted];
    }

    async listFiles(): Promise<Sample[]> {        
        this.files = await this.prisma.sample.findMany();
        return this.files;
    }

}