import 'reflect-metadata';
import 'dotenv/config';

import { container } from "tsyringe";
import { MK3Controller } from './Hardware/MK3Controller';
import { PIXIUIController } from './UI/PIXIUIController';
import { UITools } from './UI/UITools';
import { Container, Text } from '@pixi/node';
import { PixiWidget, WidgetOption } from './Widgets/PixiWidget';
import { EventBus } from './Core/EventBus';
import { filter } from 'rxjs';
import { OscillatorWidget } from './Widgets/OscillatorWidget';
import Mixer from './AudioEngine/mixer';
import AudioEngine from './AudioEngine/audioEngine';
import { ListPickerWidget } from './Widgets/ListPickerWidget';
import { SamplerWidget } from './Widgets/SamplerWidget';
import { SampleBrowser } from './Widgets/BrowserWidget';

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
    AudioEngine.mixer = mixer;

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
    
    //const oscWidget = new OscillatorWidget();
    //ui.addWidget(oscWidget, 'left');

    // add a list picker 
/*    console.log('Add list');
    const lp = new ListPickerWidget<{ value: number, label: string}>([
        { label: 'Test 1', value: 1 },
        { label: 'Test 2', value: 2 },
        { label: 'Test 3', value: 3 },
        { label: 'Test 4', value: 4 },
    ], 'label');
    ui.addWidget(lp);*/

    const samplerWidget = new SamplerWidget();
    ui.addWidget(samplerWidget);

    /*
    const browse = new SampleBrowser();
    ui.addWidget(browse);

    browse.result.subscribe(r => {
        console.log('browser set', r);
    })*/
} )();