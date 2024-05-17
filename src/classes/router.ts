import { QMainWindow, QStackedWidget, QWidget } from "@nodegui/nodegui";

import { Page } from "./page";

//import { APP_NAME } from "src/main";


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
    pageRef: Record<number, Page> = {}

    addRoute(route: string, widget: Page) {
        const newIndex = this.stack.count();        
        this.stack.addWidget(widget);
        this.routes[route] = newIndex;
        this.pageRef[newIndex] = widget;
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
            if(newRouteIdx !== this.stack.currentIndex()) {
                this.pageRef[this.stack.currentIndex()].destroyPage();
            }
            this.stack.setCurrentIndex(newRouteIdx);
            this.pageRef[this.stack.currentIndex()].onLoad();
        } else {
            throw new Error("NO ROUTE FOUND WITH NAME: " + route);
        }

    }
}

export default WidgetRouter.instance;