import { Subject } from "rxjs";

type InputEvent = {
    id: string;
    data?: Buffer;
}

class EventBus {
    public static get instance(): EventBus {
        if(!this._instance) {
            this._instance = new EventBus();
        }
        return this._instance;
    }
    private static _instance: EventBus;
    private constructor() {
        this.events$ = new Subject();
    }
    public events$: Subject<InputEvent>;
}

export default EventBus.instance;