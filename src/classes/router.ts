import { QMainWindow, QWidget } from "@nodegui/nodegui";

import { APP_NAME } from "src/main";
import { Page } from "./page";

class WidgetRouter {        
    win: QMainWindow;
    routes: Record<string, Page> = {};
    
    constructor(win: QMainWindow) {        
        this.win = win;
    }

    addRoute(route: string, widget: Page) {
        this.routes[route] = widget;
        if(Object.entries(this.routes).length === 1) {
            this.navigate(route);
        }
    }

    navigate(route: string): void {
        this.win.centralWidget()?.delete();
        this.win.setWindowTitle(APP_NAME + ' | ' + this.routes[route].title);
        this.win.setCentralWidget(this.routes[route]);
    }
}

export default WidgetRouter;