import { QMainWindow } from '@nodegui/nodegui';
import WidgetRouter from "./classes/router";
import mainPage from './pages/main.page';
import sourceMapSupport from 'source-map-support';

declare var global: { win: QMainWindow};
sourceMapSupport.install();
const win = new QMainWindow();
export const router = new WidgetRouter(win);
export const APP_NAME = 'MaschinePI';
function main(): void {
  win.setWindowTitle(APP_NAME);
  win.setFixedSize(800, 472);
  
  router.addRoute('main', mainPage);

  win.show();
  global.win = win;
}
main();
