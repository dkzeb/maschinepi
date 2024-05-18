import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";
import { QMainWindow, QMenuBar } from "@nodegui/nodegui";

import WidgetRouter from "./classes/router";
import mainPage from "./pages/main.page";
import openProjectPage from "./pages/open-project.page";
import projectPage from "./pages/project.page";
import jpeg from 'jpeg-js';
import fs from 'node:fs';
import path from 'node:path';
import { MK3GraphicsController, Mk3Display } from "./classes/MK3Controller";

declare const global: { win: QMainWindow, router: typeof WidgetRouter} //, se: SoundEngine}; //, prisma: PrismaClient };
global.router = WidgetRouter;
//global.se = se;

class Main {
  private static _instance: Main;
  private constructor(){}
  public static get instance(): Main {
    if(!this._instance) {
      this._instance = new Main();
    }
    return this._instance;
  }

  public router = WidgetRouter;

  async init() {
    console.log('Starting MaschinePI');

    this._win = new QMainWindow();
    this._win.setWindowTitle("MaschinePI");  
    this._win.setFixedSize(800, 480);    

    const controller = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);  
    await controller.init();    

    const welcomeSplash = jpeg.decode(fs.readFileSync(path.join(process.cwd(), 'assets', 'images', 'maschinepi-splash.jpg')), { useTArray: true, formatAsRGBA: false});    
    const mk3Gfx = new MK3GraphicsController(controller);
    mk3Gfx.sendImage(welcomeSplash.data, Mk3Display.left);    
    mk3Gfx.showVersion();
    mk3Gfx.padIntro();
    
    this.router.addRoute('main', mainPage);
    this.router.addRoute('open-project', openProjectPage);
    this.router.addRoute('project', projectPage);

    this._win.setCentralWidget(this.router.stack);
    
    this._win.show();
    
    global.win = this._win;
  }

  setMenuBar(menu: QMenuBar) {
    this._win.setMenuBar(menu);
  }

  private _win: QMainWindow;
}

Main.instance.init();

export default Main.instance;