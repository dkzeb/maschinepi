import 'reflect-metadata';
import { container } from "tsyringe";
import { MK3Controller } from './Hardware/MK3Controller';
import { PIXIUIController } from './UI/PIXIUIController';
import { UITools } from './UI/UITools';
import { Container, Text } from '@pixi/node';
import { PixiWidget, WidgetOption } from './Widgets/pixi/PixiWidget';
import { EventBus } from './Core/EventBus';
import { filter } from 'rxjs';
import { OscillatorWidget } from './Widgets/pixi/OscillatorWidget';


( async () => {
    
    // hardware
    const mk3 = await container.resolve(MK3Controller);
    await mk3.init();
    
    const ebus = await container.resolve(EventBus);

    const ui = await container.resolve(PIXIUIController);
    // async main loop        

    const objA = new Container();
    objA.width = 480;
    objA.height = 272;

    const widgetOptions: WidgetOption[] = [
        {
            ui: {
                label: 'Test',
                slot: 0,
            },
            buttonId: 'd1',
            cb: () => {
            }
        }
    ]

    /*
    // create a new PixiWidget
    const pw = new PixiWidget({
        name: 'MyFirstWidget',
        dims: {
            x: 0, y: 0, w: 480, h: 272
        },
        options: widgetOptions
    });

    const dRegEx = new RegExp('d[1-8]');
    ebus.events.pipe(filter(ev => ev.type === 'ButtonInput' && dRegEx.test(ev.name ?? ''))).subscribe(e => {        
        const id = e.name?.substring(0, 2);
        const action = e.name?.substring(3);        
        const w = widgetOptions.find(w => w.buttonId === id);
        if(w) {
            if(action === 'pressed') {
                w.cb();
                w.ui.active = true;
            } else {
                w.ui.active = false;
            }            
            ui.renderDisplayObject('left', pw.draw());
        }
    });

    ui.renderDisplayObject('left', pw.draw());    */
    const oscWidget = new OscillatorWidget();
    ui.renderDisplayObject('left', oscWidget.draw());
/*
    // lets get a menu going
    const menu = UITools.DrawMenu([
        {
            label: 'D1',
            slot: 0
        },
        {
            label: 'D2',
            slot: 3
        }
    ])

    menu.position.set(0, 0);

    
    const txt = new Text("Test", { fill: '#ffffff'});
    txt.position.set(10, 60);

    objA.addChild(menu, txt);        
    ui.renderDisplayObject('left', objA);

    const objB = new Container();
    objB.width = 480;
    objB.height = 272;
    ui.renderDisplayObject('right', objB);
    */
} )();