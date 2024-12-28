import { PIXIUIController } from "../UI/PIXIUIController";
import { container } from "tsyringe";
import { PaginatedList } from "./PaginatedListWidget";
import { PixiWidget } from "./PixiWidget";
import { DisplayObject } from "@pixi/node";
import { Subject } from "rxjs";
import AudioEngine from '../AudioEngine/audioEngine';
import { StorageController } from "../Core/StorageController";
import { UITools } from "src/UI/UITools";

export class SampleBrowser extends PixiWidget {
    ui: PIXIUIController = container.resolve(PIXIUIController);
    list!: PaginatedList;
    items: any[] = [];

    result: Subject<string> = new Subject();

    private currentIndex = 0;
    private numberOfItems = 0;

    private storage: StorageController = container.resolve(StorageController);

    previewActive = false;

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
                }
            }]
        });    


        console.log('what is my sample dir?', this.storage.sampleDir);
        this.items = this.storage.listDir(this.storage.sampleDir);

        this.numberOfItems = this.items.length;
        this.list =  new PaginatedList({
            items: this.items,
        });
        this.list.setActiveItem(0);    
        this.setupEvents();

        // activated sub for preview handling and so on
        this.list.activated.subscribe(item => {
            if(this.previewActive) {
                this.handlePreview(item);
            }
        });        
    }
    
    handlePreview(item: any) {
        console.log('preview', item);
        // check if sample is loaded, else load and then play
        AudioEngine.playSource(item);
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