import { Assets, Container, DisplayObject, Graphics, Sprite, Text } from "@pixi/node";
import { Dims, PIXIUIController, UIKnob, UIOption } from "../../UI/PIXIUIController";
import { UIConstants, UITools } from "../../UI/UITools";
import { EventBus } from "../../Core/EventBus";
import { container } from "tsyringe";
import { filter } from "rxjs";
import * as path from 'path';

export type WidgetOption = {
    ui: UIOption,
    buttonId: 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8',
    toggleable?: {
        state: boolean;
        activeColor: string;
    };
    cb: (...args: any[]) => void | Promise<void>
}

export type WidgetKnob = {
    ui: UIKnob,
    knobId: string
}

export type PixiWidgetOptions = {
    name: string;
    dims?: Dims,
    options?: WidgetOption[],
    knobs?: WidgetKnob[],
    themeBg?: boolean,
    modal?: boolean,
    titlebar?: {
        color: string,
        title: string
    }
}

export class PixiWidget {
    opts: PixiWidgetOptions;
    ebus: EventBus = container.resolve(EventBus);
    ui: PIXIUIController = container.resolve(PIXIUIController);
    
    containers: Record<string, Container> = {
        menu: new Container(),
        main: new Container(),
        knobs: new Container()    
    }

    bgImg?: Sprite;
    isInit: boolean = false;
    preInitDrawCalls = 0;

    constructor(opts: PixiWidgetOptions) {
        this.opts = opts;        

        if(!opts.dims) {
            this.opts.dims = {
                x: 0, y: 0, w: 480, h: 272
            }
        }

        console.log(`PixiWidget ${opts.name} constructed`);                
        
        this.setupBg().then(() => {
            this.init();
        });        
    }

    init() {
        this.setupMenuAndKnobEvents();    
        this.isInit = true;
    }

    async setupBg() {
        if(this.opts.themeBg) {
            const bgImgTex = await Assets.load(path.join(process.cwd(), 'data', 'images', 'mpi-widgetbg1.png'));            
            this.bgImg = Sprite.from(bgImgTex);            
        }
    }

    teardown() {
        // unsub to any events 
        this.ebus.clearOwnerSubscriptions(this.opts.name);
    }

    setupMenuAndKnobEvents() {        
        
        if(this.opts.options) {

            this.ebus.filterEvent('ButtonInput', this.opts.name, 'd[1-8]', (ev) => {                
                const opt = this.opts.options?.find(o => o.buttonId === ev.name?.substring(0, 2));
                if(opt) {
                    const action = ev.name?.substring(3);       

                    if(opt.toggleable) {
                        if(action === 'pressed') {
                            opt.toggleable.state = !opt.toggleable.state
                            opt.ui.active = opt.toggleable.state;
                            console.log('toggling', opt.buttonId, 'to', opt.ui.active );
                            opt.cb(opt);
                        }
                    } else {
                        if(action === 'pressed') {
                            opt.ui.active = true;                            
                            opt.cb(opt);
                        } else {
                            opt.ui.active = false;                        
                        }
                }                                           
                    if(opt.ui.active) {                        
                    }
                    this.ui.renderDisplayObject('left', this.draw());
                }
            });

        }

        if(this.opts.knobs) {
            const kInpRegEx = new RegExp('k[1-8]');
            const knTouchRegEx = new RegExp('knobTouch[1-8]');
            this.ebus.events.pipe(filter(e => e.type === 'KnobInput' && kInpRegEx.test(e.name ?? ''))).subscribe(ev => {
                console.log('knobInput', ev);
            });

            this.ebus.events.pipe(filter(e => e.type === 'ButtonInput' && knTouchRegEx.test(e.name ?? ''))).subscribe(ev => {

            });
        }
    }

    draw(): DisplayObject {        
        const container = new Container();        
        container.width = this.opts.dims!.w;
        container.height = this.opts.dims!.h;        
        
        /* TODO: Fix bg rendering when we figure it out
        if(this.opts.themeBg && this.bgImg) {            
            this.bgImg!.x = 0; this.bgImg!.y = 0;
            this.bgImg!.height = 272;
            this.bgImg!.width = 960;
            container.addChildAt(this.bgImg!, 0);            
        }*/

        if(this.opts.options) {
            const uiOptions = this.opts.options.map(o => o.ui);            
            this.containers.menu.removeChildren(0);
            const menu = UITools.DrawMenu(this.opts.options);
            menu.x = 0;
            menu.y = 0;
            this.containers.menu.addChild(menu);
            container.addChild(this.containers.menu);            
        }
    
        /*let availableHeight = 272;
        if(this.opts.options) {
            availableHeight -= UIConstants.option.height;
            this.containers.main.x = 35;
        }

        if(this.opts.options) {
            availableHeight -= UIConstants.knob.height;        
        }

        this.containers.main.height = availableHeight;
        this.containers.main.width = container.width;*/
        
        /*const bg = new Graphics();
        bg.beginFill("#33fff6", 1);
        bg.drawRect(0, 0, this.opts.dims.w, this.opts.dims.h - (!!this.opts.options ? 35 : 0) - (!!this.opts.knobs ? 35 : 0));
        bg.endFill();
        this.containers.main.addChildAt(bg, 0);*/

        let mainYOffset = !!this.opts.options ? UIConstants.option.height + 5 : 0;            

        if(this.opts.titlebar) {
            mainYOffset += 35;
            const titleBar = UITools.DrawTitlebar({ title: this.opts.titlebar.title });
            if(this.opts.options) {
                titleBar.y = 35;
            }        
            this.containers.menu.addChild(titleBar);
        }
        
        this.containers.main.y = mainYOffset;

        //this.containers.main.addChildAt(0)

        container.addChild(this.containers.main);


        if(this.opts.knobs) {
            const uiKnobs = this.opts.knobs.map(k => k.ui);
            this.containers.knobs.removeChildren(0);
            console.log('drawing ui knobs');            
            const kContainer = UITools.DrawKnobs(uiKnobs);
            kContainer.x = container.height - UIConstants.knob.height;
            this.containers.knobs.addChild(kContainer);
            container.addChild(this.containers.knobs);         
        }        

        return container;
    }

}