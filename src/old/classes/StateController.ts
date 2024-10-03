import { EventBus } from "./EventBus";


export class StateController {

    controllerState: ControllerState = {};
    appState: AppState = {};
    modeState: any = {};
    ebus: EventBus;
 
    constructor(ebus: EventBus) {
        this.ebus = ebus;        
    }   
    
    setState(mode: object) {        
        console.log('set state was called');
    }
}

type AppState = {    
}

type ControllerState = {    
}