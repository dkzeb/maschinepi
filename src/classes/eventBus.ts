import { Subject } from "rxjs";

export type MPIEvent = {
    name?: string;
    type: EventType;
    data?: any;
}
type EventType = "PadInput" | "ButtonInput" | "TouchInput" | "Init" | 'UpdateDisplay' | 'ChangeMode' | 'KnobInput' | 'LoadWidget';

export class EventBus {
    events: Subject<MPIEvent>;
    eventHistory: MPIEvent[] = [];

    constructor() {
        this.events = new Subject();
    }

    processEvent(ev: MPIEvent) {
        this.eventHistory.push(ev);
        this.events.next(ev);
    }

    getByType(type: EventType): MPIEvent[] {
        return this.eventHistory.filter((e => e.type === type));
    }
}