import { QMainWindow, QStackedWidget } from "@nodegui/nodegui";
import WidgetRouter from "./classes/router";
import mainPage from "./pages/main.page";
import openProjectPage from "./pages/open-project.page";

declare const global: { win: QMainWindow, router: typeof WidgetRouter };

const win = new QMainWindow();

global.win = win;
global.router = WidgetRouter;

function main() {
  console.log('MaschinePI Starting...');
  win.setWindowTitle("MaschinePI");  
  win.setFixedSize(800, 480);    
  
  WidgetRouter.addRoute('main', mainPage);
  WidgetRouter.addRoute('open-project', openProjectPage);
  win.setCentralWidget(WidgetRouter.stack);
  
  win.show();  
}

main();