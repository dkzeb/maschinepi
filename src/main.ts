import { QMainWindow } from "@nodegui/nodegui";
import WidgetRouter from "./classes/router";
import mainPage from "./pages/main.page";

declare const global: { win: QMainWindow, router: WidgetRouter };

const win = new QMainWindow();
export const router = new WidgetRouter(win);

function main() {
  console.log('MaschinePI Starting...');
  win.setWindowTitle("MaschinePI");
  
  win.setFixedSize(800, 480);

  router.addRoute('main', mainPage);
  
  win.show();

  global.win = win;
  global.router = router;
}

main();