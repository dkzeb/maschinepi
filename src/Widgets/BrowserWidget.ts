import { PIXIUIController } from "../UI/PIXIUIController";
import { ListPickerWidget } from "./ListPickerWidget";
import * as fs from 'fs';
import * as path from 'path';
import { container } from "tsyringe";
import { PaginatedList } from "./PaginatedListWidget";
import { PixiWidget } from "./PixiWidget";
import { DisplayObject } from "@pixi/node";
import { Subject } from "rxjs";
import AudioEngine from '../AudioEngine/audioEngine';
import { StorageController } from "../Core/StorageController";

export class SampleBrowser extends PixiWidget {
    ui: PIXIUIController = container.resolve(PIXIUIController);
    list!: PaginatedList;
    items: any[] = [];

    result: Subject<string> = new Subject();

    private browserInit = false;

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
    }

    override async init(): Promise<void> {
        if(!this.browserInit) {
            const samples = await this.storage.prisma.sample.findMany()
            this.numberOfItems = samples.length;
            
            this.items = samples.map(s => s.name);
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
    
            this.browserInit = true;
        }
    }
    
    handlePreview(item: any) {
        console.log('item', item);
        const previewDisplay = this.ui.getDisplay('right');
        //AudioEngine
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

    override async draw(): Promise<DisplayObject> {

        if(!this.browserInit) {
            await this.init();
        }
                
        this.containers.main = this.list.getGraphics();         
        return await super.draw();
    }
}