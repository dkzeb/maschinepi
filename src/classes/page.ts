import { QLayout, QWidget } from "@nodegui/nodegui";

export abstract class Page extends QWidget {
    title: string;
    pageLayout: QLayout;
    constructor(title: string) {
        super();
        this.title = title;
        this.createLayout();
    }
    protected abstract createLayout();
}