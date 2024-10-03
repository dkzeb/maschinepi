import { Widget } from "src/old/classes/UI/widgets/widget";


export class Project {

    private _name: string = 'untitled';
    private _bpm: number = 120;

    private _plugins: Widget[] = [];

    constructor(name?: string, bpm?: number) {
        if(name) {
            this._name = name;
        }

        if(bpm) {
            this._bpm = bpm;
        }
    }

    loadProject() {
        // load default widgets here
        // playlist
        // mixer
        // sequencer
    }

    static Parse(pdto: any): Project {
        return new Project(pdto.name, pdto.bpm);
    }
    
}
