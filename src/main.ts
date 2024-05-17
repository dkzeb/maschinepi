import { QMainWindow } from "@nodegui/nodegui";
import WidgetRouter from "./classes/router";
import mainPage from "./pages/main.page";
import openProjectPage from "./pages/open-project.page";
import projectPage from "./pages/project.page";
import SoundEngine from "./classes/soundEngine";
import { PrismaClient } from "@prisma/client";

import MK3Controller from "./classes/MK3Controller";

declare const global: { win: QMainWindow, router: typeof WidgetRouter} //, se: SoundEngine}; //, prisma: PrismaClient };

const win = new QMainWindow();
const prisma = new PrismaClient();

global.win = win;
global.router = WidgetRouter;
//global.se = se;
//global.prisma = prisma;

async function main() {
  console.log('MaschinePI Starting...');
  MK3Controller.connect();

  win.setWindowTitle("MaschinePI");  
  win.setFixedSize(800, 480);    
  
  WidgetRouter.addRoute('main', mainPage);
  WidgetRouter.addRoute('open-project', openProjectPage);
  WidgetRouter.addRoute('project', projectPage);

  win.setCentralWidget(WidgetRouter.stack);
  
  win.show();  
}

main();