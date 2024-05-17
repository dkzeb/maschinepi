import { Pad } from "src/classes/pad";
import { Page } from "src/classes/page";
import { QGridLayout } from "@nodegui/nodegui";

export class ProjectPage extends Page {

    pads: Pad[];

    protected createLayout() {
        this.pageLayout = new QGridLayout();
        this.setLayout(this.pageLayout);
        this.setObjectName('projectPage')
        this.pads = [];
        for(let i = 0; i < 16; i++) {
            this.pads[i] = new Pad("pad"+i);
            this.pads[i].setText("Pad " + (i + 1));
        }
        this.pageLayout.addWidget(this.pads[12], 0, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[13], 0, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[14], 0, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[15], 0, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[8], 1, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[9], 1, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[10], 1, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[11], 1, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[4], 2, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[5], 2, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[6], 2, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[7], 2, 3, 1, 1);

        this.pageLayout.addWidget(this.pads[0], 3, 0, 1, 1);
        this.pageLayout.addWidget(this.pads[1], 3, 1, 1, 1);
        this.pageLayout.addWidget(this.pads[2], 3, 2, 1, 1);
        this.pageLayout.addWidget(this.pads[3], 3, 3, 1, 1);

        this.setStyleSheet(`
            #projectPage {
                background-color: 'black';
            }
            #projectPage QPushButton {
                height: 100px;
            }
        `);
    }
}

export default new ProjectPage("ProjectPage");