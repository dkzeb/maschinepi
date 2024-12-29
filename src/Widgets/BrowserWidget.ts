import { PIXIUIController } from "../UI/PIXIUIController";
import { container } from "tsyringe";
import { PaginatedList } from "./PaginatedListWidget";
import { PixiWidget } from "./PixiWidget";
import { DisplayObject } from "@pixi/node";
import { Subject } from "rxjs";
import AudioEngine from '../AudioEngine/audioEngine';
import { StorageController } from "../Core/StorageController";
import { UITools } from "../UI/UITools";

export class SampleBrowser extends PixiWidget {
    ui: PIXIUIController = container.resolve(PIXIUIController);
    list!: PaginatedList;
    items: any[] = [];

    result: Subject<string> = new Subject();

    private currentIndex = 0;
    private numberOfItems = 0;

    private storage: StorageController = container.resolve(StorageController);

    private previewDisplay = this.ui.getDisplay('right');
    previewActive = false;

    debouncedHandlePreview = debounce(this.handlePreview, 200);

    constructor() {    
        super({
            name: 'Browse Samples',
            options: [{
                buttonId: 'd4',
                toggleable: {
                    state: false,
                    activeColor: '#4c32a8'
                },
                ui: {
                    label: 'Preview',
                    slot: 3
                },
                cb: (o) => {
                    this.previewActive = o.ui.active;                
                    if(this.previewActive && this.previewDisplay) {
                        this.debouncedHandlePreview(this.list.getActiveItem(), this.previewDisplay, this.previewActive);       
                    }
                }
            }]
        });    

        this.items = this.storage.listDir(this.storage.sampleDir);

        this.numberOfItems = this.items.length;
        this.list =  new PaginatedList({
            items: this.items,
        });
        this.list.setActiveItem(0);    
        this.handlePreview(this.list.getActiveItem(), this.previewDisplay, this.previewActive);

        this.setupEvents();

        // activated sub for preview handling and so on
        this.list.activated.subscribe(item => {
            this.handlePreview(item, this.previewDisplay, this.previewActive);
        });        
    }
    
    handlePreview(item: any, previewDisplay: SampleBrowser['previewDisplay'], previewActive: boolean = false) {
        
        // play preview if preview is active
        if(previewActive) {
            AudioEngine.playSource(item);
        }    
        // draw the audio waveform
        AudioEngine.getWaveform(item).then((gfx) => {
            previewDisplay.container.removeChildren();
            previewDisplay.container.addChild(
                gfx
            );
        });
    }

    setupEvents() {
        this.ebus.filterEvent('KnobInput', this.opts.name, 'navStep', (ev) => {
            if(ev.data.direction) {
                this.currentIndex += ev.data.direction;
                if(this.currentIndex >= this.numberOfItems) {
                    this.currentIndex = this.numberOfItems - 1;
                }
                if(this.currentIndex < 0) {
                    this.currentIndex = 0;
                }
                this.list.setActiveItem(this.currentIndex);
            }
        });

        this.ebus.filterEvent('ButtonInput', this.opts.name, 'navPush', ev => {            
            if(ev.name!.indexOf('released') > -1) {
                if(this.result.observed) {
                    this.result.next(this.items[this.currentIndex])
                }
            }
        });
    }

    override teardown(): void {
        super.teardown();

        this.result.complete();
        this.list.activated.unsubscribe();
    }

    override draw(): DisplayObject {
                
        this.containers.main = this.list.getGraphics();         
        return super.draw();
    }
}


function debounce<T extends unknown[]>(
    func: (...args: T) => void,
    delay: number
  ): (...args: T) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
    return (...args: T) => {
        if(timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}
