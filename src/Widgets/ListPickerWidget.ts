import { Subject } from "rxjs";
import { UITools } from "../UI/UITools";
import { PixiWidget } from "./PixiWidget";
import { DisplayObject } from "@pixi/node";

export class ListPickerWidget<T> extends PixiWidget {
    selected?: T;  
    items: T[] = [];
    currentIndex = 0;
    activateItem?: (idx) => void;
    labelKey?: keyof T;

    itemActivated: Subject<T> = new Subject();
    itemSelected: Subject<T> = new Subject();

    constructor(items: T[], labelKey?: keyof T) {
        super({
            name: 'ListPickerWidget'            
        });        
        this.items = items;        
        this.labelKey = labelKey;
        this.setupEvents();
    }

    setupEvents() {
        this.ebus.filterEvent('KnobInput', this.opts.name, 'navStep', (ev) => {
            if(ev.data.direction) {
                this.currentIndex += ev.data.direction;
                if(this.currentIndex >= this.items.length) {
                    this.currentIndex = this.items.length - 1;
                }
                if(this.currentIndex < 0) {
                    this.currentIndex = 0;
                }
                if(this.activateItem) {
                    this.activateItem(this.currentIndex);
                    this.selected = this.items[this.currentIndex];
                    this.itemActivated.next(this.selected);
                }
            }
        });

        this.ebus.filterEvent('ButtonInput', this.opts.name, 'navPush', ev => {            
            if(ev.name!.indexOf('released') > -1 && this.selected) {
                this.itemSelected.next(this.selected);                
            }
        });
    }

    override teardown() {
        super.teardown();

        if(this.itemSelected.observed) {
            this.itemSelected.complete();
        }

        if(this.itemActivated.observed) {
            this.itemActivated.complete();
        }
    }

    override draw(): DisplayObject {        
        const ui = UITools.DrawListPicker<T>(this.items, this.labelKey);
        if(!this.activateItem) {
            ui.setActive(this.currentIndex);
        }
        this.activateItem = ui.setActive;
        return ui.graphics;

    }

}