import 'reflect-metadata';
import { container } from "tsyringe";
import { MK3Controller } from './Hardware/MK3Controller';
import { PIXIUIController } from './UI/PIXIUIController';
import { UITools } from './UI/UITools';
import { Container, Text } from '@pixi/node';
import { EventBus } from './Core/EventBus';
import { OscillatorWidget } from './Widgets/pixi/OscillatorWidget';
import Mixer from './AudioEngine/mixer';
import { DAW } from './Core/DAW';

import AudioEngine from './AudioEngine/audioEngine';
import { ZPCWidget } from './Widgets/pixi/SamplerWidget';

let exitHandler: any;

process.on('SIGINT', async () => {
    console.log('we are exitting!');
    if(exitHandler !== undefined && typeof exitHandler === 'function') {
        exitHandler();
    }
});

( async () => {
    
    
    // hardware
    const mk3 = await container.resolve(MK3Controller);
    await mk3.init();    
    const ebus = await container.resolve(EventBus);
    const ui = await container.resolve(PIXIUIController);

    await UITools.LoadUIAssets();
    

    const mixer = await container.resolve(Mixer);
    await mixer.initMixer();
    
    const daw = new DAW();


    // setup exit handler
    exitHandler = () => {
        console.log('Shutting down...');
        const shuttingDown = new Text("Shutting Down...", {
            fill: '#ffffff'
        });
        shuttingDown.anchor.set(.5, .5);
        shuttingDown.x = 480 / 2;
        shuttingDown.y = 272 / 2;

        const byeBye = new Text("Bye bye!", {
            fill: '#ffffff'
        });
        byeBye.anchor.set(.5, .5);
        byeBye.x = 480 + (480 / 2);
        byeBye.y = 272 / 2;

        const container = new Container();
        container.addChild(shuttingDown, byeBye);        
    }

    // async main loop        
    /*
    const oscWidget = new OscillatorWidget();
    ui.addWidget(oscWidget, 'left');*/

    const zpcWidget = new ZPCWidget();
    ui.addWidget(zpcWidget, 'left');
} )();