import { FlexLayout, QLabel, QPixmap, QPushButton, QWidget } from "@nodegui/nodegui";

import { Page } from "src/classes/page";
import path from 'node:path';
import { router } from "src/main";

class MainPage extends Page {    

    protected createLayout() {
        this.pageLayout = new FlexLayout();
        this.setLayout(this.pageLayout);
        this.setObjectName("main");
        const welcomeLabel = new QLabel();
        welcomeLabel.setObjectName("logo");
        const imagePath = path.join(process.cwd(), 'assets', 'Logo.png');
        const logoImg = new QPixmap();
        logoImg.load(imagePath);
        welcomeLabel.setPixmap(logoImg);
        this.pageLayout.addWidget(welcomeLabel);

        // welcome button layout
        const buttonsContainer = new QWidget();
        buttonsContainer.setObjectName('buttonsContainer');
        const buttonsLayout = new FlexLayout();
        buttonsContainer.setLayout(buttonsLayout);

        buttonsContainer.setStyleSheet(`
            #buttonsContainer {
                flex-direction: row;
            }
        `)


        const newBtn = new QPushButton();
        newBtn.setText('New Project');
        newBtn.setObjectName('newButton');
        buttonsLayout.addWidget(newBtn);

        const openBtn = new QPushButton();
        openBtn.setText('Open Project');
        openBtn.setObjectName('openButton');
        openBtn.addEventListener('clicked', () => {
            console.log('open project');
        });
        buttonsLayout.addWidget(openBtn);

        this.pageLayout.addWidget(buttonsContainer);

        this.setStyleSheet(`#main {
            justify-content: 'center';
            align-items: 'center';
            background-color: 'black';
        }
        #logo {
            margin-bottom: 12px;
        }
        #newButton,
        #openButton {
            height: 100;
            width: 200;
            margin: 4px; 
            border: 2px solid white;            
            color: 'white';
            font-size: 24px;
            font-weight: 'bold';
            background-color: 'black';
        }
        `);
    }
}

export default new MainPage("MainPage");