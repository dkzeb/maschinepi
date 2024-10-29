import { Container } from "@pixi/node";
import { PixiWidget } from "./PixiWidget";

type LoadingWidgetOpts = {
    frames: number;
    fps: number;
    introFrames?: number[];
    outroFrames?: number[];
    loopFrames?: number[];
}

export class LoadingWidget extends PixiWidget {

    constructor() {
        super({
            name: 'LoadingWidget',
        });

        this.setupContainers();
    }

    setupContainers() {
        this.containers.main = new Container();
    }

    start() {
    }

    stop() {    
    }

}