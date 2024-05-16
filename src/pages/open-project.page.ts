import { FlexLayout, QLabel, QPushButton } from "@nodegui/nodegui";
import { Page } from "src/classes/page";
import WidgetRouter from '../classes/router';

class OpenProjectPage extends Page {

    protected createLayout() {
        this.pageLayout = new FlexLayout();
        this.setLayout(this.pageLayout);
        
        const openLabel = new QLabel();
        openLabel.setText("Open Project");
        this.pageLayout.addWidget(openLabel);

        const backButton = new QPushButton();
        backButton.setText("Back");
        backButton.addEventListener('clicked', () => {
            WidgetRouter.navigate('main');
        });
        this.pageLayout.addWidget(backButton);
        
    }
    
}

export default new OpenProjectPage("OpenProject"); 