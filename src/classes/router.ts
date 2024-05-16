import { QMainWindow, QStackedWidget, QWidget } from "@nodegui/nodegui";

//import { APP_NAME } from "src/main";
import { Page } from "./page";

class WidgetRouter {        
    private static _instance: WidgetRouter;
    private constructor() {
        this.stack = new QStackedWidget();
    }

    public static get instance(): WidgetRouter {
        if(!this._instance) {
            this._instance = new WidgetRouter();
        }
        return this._instance;
    }

    public stack: QStackedWidget;
    routes: Record<string, number> = {};

    addRoute(route: string, widget: Page) {
        const newIndex = this.stack.count();
        console.log('adding new route', route, newIndex);
        this.stack.addWidget(widget);
        this.routes[route] = newIndex;
        console.log('theese routes')
        if(Object.entries(this.routes).length === 1) {
            this.navigate(route);
        }
    }

    navigate(route: string): void {
        if(!this.stack) {
            throw new Error("No Stack");
        }

        const newRouteIdx = this.routes[route];
        if(newRouteIdx != null) {
            this.stack.setCurrentIndex(newRouteIdx)
        } else {
            throw new Error("NO ROUTE FOUND WITH NAME: " + route);
        }

    }
}

export default WidgetRouter.instance;