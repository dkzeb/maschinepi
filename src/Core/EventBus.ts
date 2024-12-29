import { filter, Subject, Subscription } from "rxjs";
import { singleton } from "tsyringe";

export type MPIEvent = {
    name?: string;
    type: EventType;
    data?: any;
}
export type EventType = 
    "PadInput" | "ButtonInput" | "TouchInput" | "Init" | "UIInit" | 'UIEvent' | 'ChangeMode' | 'ApplicationEvent' |
    'KnobInput' | 'LoadWidget' | 'WidgetResult' | 'CloseWidget' | 'UpdateWidget' | 'WidgetEvent';

@singleton()
export class EventBus {
    events: Subject<MPIEvent>;
    subscriptions: Record<string, Subscription[]> = {};
    eventHistory: MPIEvent[] = [];

    constructor() {
        this.events = new Subject();
    }

    filterEvent(type: EventType, owner: string, regEx: string = '', cb?: (ev: MPIEvent) => void) {
        let regExFn: RegExp = regEx && regEx !== '' ? new RegExp(regEx) : new RegExp('');

        if(regEx && regEx !== '') {
            console.log('regEx', regEx);
            regExFn = new RegExp(regEx);
        }

        const sub = this.events.pipe(filter(e => e.type === type && regExFn.test(e.name ?? ''))).subscribe(
            (ev) => {
                if(cb) {
                    cb(ev);
                } else {
                    console.log('EV no CB', ev);
                }
            }
        );

        if(!this.subscriptions[owner]) {
            this.subscriptions[owner] = [sub];
        } else {
            this.subscriptions[owner].push(sub);
        }
    }

    clearOwnerSubscriptions(owner: string) {
        if(this.subscriptions[owner]) {
            this.subscriptions[owner].forEach(s => {
                s.unsubscribe();
            });
        }
    }

    processEvent(ev: MPIEvent) {        
        this.eventHistory.push(ev);        
        this.events.next(ev);        
    }

    getByType(type: EventType): MPIEvent[] {
        return this.eventHistory.filter((e => e.type === type));
    }
}