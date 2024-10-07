import { Widget, WidgetOptions } from "./Widget";



export class ListPickerWidget extends Widget<ListPickerWidget> {

    constructor(opts: WidgetOptions) {
        super(opts);
    }

    async render(): Promise<string> {
        return '';
    }   
    
    
}