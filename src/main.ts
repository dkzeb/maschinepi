import { MaschineMk3, createNodeHidAdapter, createNodeUsbAdapter } from "ni-controllers-lib";

import { QMainWindow } from "@nodegui/nodegui";
import WidgetRouter from "./classes/router";
import mainPage from "./pages/main.page";
import openProjectPage from "./pages/open-project.page";
import projectPage from "./pages/project.page";

declare const global: { win: QMainWindow, router: typeof WidgetRouter} //, se: SoundEngine}; //, prisma: PrismaClient };

const win = new QMainWindow();

global.win = win;
global.router = WidgetRouter;
//global.se = se;

async function main() {
  console.log('MaschinePI Starting...');  
  win.setWindowTitle("MaschinePI");  
  win.setFixedSize(800, 480);    

  const controller = new MaschineMk3(createNodeHidAdapter, createNodeUsbAdapter);
  
  WidgetRouter.addRoute('main', mainPage);
  WidgetRouter.addRoute('open-project', openProjectPage);
  WidgetRouter.addRoute('project', projectPage);

  win.setCentralWidget(WidgetRouter.stack);
  
  win.show();  

}

main();