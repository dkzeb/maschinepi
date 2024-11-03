
import { ModalWidget } from "./ModalWidget";
import { PixiWidget } from "./PixiWidget";
import { Container, DisplayObject } from "@pixi/node";
import { ListPickerItem, UITools } from "@/UI/UITools";
import { StorageController } from "@/Core/StorageController";
import { container } from "tsyringe";

export class ZPCWidget extends PixiWidget {

    samples: string[] = [];

    constructor() {
        super({
            titlebar: {
                title: 'ZPC',
                color: 0xFFFFFF,                
            },
            options: [
                {
                    ui: {
                        label: 'Load Sample',
                        slot: 3
                    },
                    buttonId: 'd4',
                    cb: (opt) => {
                         const modal = new SamplePicker();

                         modal.result?.subscribe((res) => {
                            console.log('i gots me a result', res);
                            //this.uiCtrl.removeWidget(modal)
                         });

                         this.uiCtrl.addWidget(modal, 'right');
                         console.log('added modal widget');
                    }
                }
            ],
            name: 'ZPCWidget'            
        });

        this.widgetUi = new Container();
        this.widgetUi.height = 272;
        this.widgetUi.width = 480;
    }
}

type Sample = {
    name: string;
    audioBufferName: string;
}

class SamplePicker extends ModalWidget<Sample> {

    storage: StorageController = container.resolve(StorageController)

    currentIndex = 0;
    numberOfItems = 0;
    currentSelection: number = 0;
    selectorActive: boolean = false;

    items: ListPickerItem<Sample>[];

    constructor() {
        super({
            name: 'SamplePicker',
            titlebar: {
                color: 0xFFFFFF,
                title: 'Pick Sample To Load',
                icon: 'none'
            }
        });        

        this.ebus.filterEvent('ButtonInput', this.opts.name, /nav(?:Touch|Push)\b/, (ev) => {
            if(ev.name && ev.name.indexOf('Touch') > -1) {
                this.selectorActive = ev.name.indexOf('pressed') > -1;
            }

            if(this.selectorActive && ev.name && ev.name.indexOf('Push:pressed') > -1)
            {
                this.resolve(this.items[this.currentSelection].value);
            }
            
        });

        this.ebus.filterEvent('KnobInput', this.opts.name, 'navStep', (ev) => {
            this.currentIndex = this.currentIndex + ev.data.direction;
            
            if(this.currentIndex < 0) {
                this.currentIndex = this.numberOfItems - 1;
            } else if(this.currentIndex > this.numberOfItems) {
                this.currentIndex = 0;
            }

            console.log('current index', this.currentIndex);

            if(this.itemActivator) {
                this.currentSelection = this.itemActivator(this.currentIndex);
            } 
        });

        // get all the available samples


        this.items = [];
        this.storage.samples.forEach(s => {
            this.items.push({
                label: s,
                value: {
                    name: s,
                    audioBufferName: s
                }
            });
        })
    }

    itemActivator?: (idx: number) => number;

    override async teardown(): Promise<void> {
        this.ebus.clearOwnerSubscriptions(this.opts.name)
    }

    override draw(): Container<DisplayObject> {        
        this.widgetUi.removeChildren();      
        this.widgetUi.height = this.opts.dims?.h ?? 272;          
        const titlebar = this.drawTitlebar();
        this.widgetUi.addChild(titlebar);
        // create a listpicker
        // generate data                
        const list = UITools.GenerateListPicker(this.items, 220);
        this.numberOfItems = this.items.length;        
        list.listContainer.y = titlebar.getBounds().height + 5;

        this.widgetUi.addChild(list.listContainer);        
        this.itemActivator = list.setItemActive;
        return this.widgetUi;
    }
}

