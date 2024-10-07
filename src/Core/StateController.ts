import { MK3Controller } from "../Hardware/MK3Controller";

export type ApplicationState = {
    isDevMode: boolean;
    dataDirectory: string;
    hardwareConnected: boolean;
}

export class StateController {

    static mk3: MK3Controller;

    private static _currentState: ApplicationState = { 
        isDevMode: false, 
        dataDirectory: '',
        hardwareConnected: false
    };

    public static set currentState(state: ApplicationState) {
        this._currentState = state;
    }

    public static get currentState(): ApplicationState {        
        return this._currentState;
    }
}