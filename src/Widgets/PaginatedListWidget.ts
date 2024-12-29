import { Graphics, Text } from '@pixi/node';
import { Subject } from 'rxjs';

interface ListItem {
  label: Text;
  bg: Graphics;
}

export class PaginatedList {
    private items: any[];
    private labelKey: string | undefined;
    private itemsPerPage: number;
    private currentPage: number;
    private totalPages: number;
    private graphics: Graphics;
    private listItems: ListItem[] = [];
    private activeItemIndex: number = -1; 

    public activated: Subject<any> = new Subject();
  
    constructor(options: {
      items: any[];
      labelKey?: string;
      itemsPerPage?: number;
    }) {
      this.items = options.items;
      this.labelKey = options.labelKey;
      this.itemsPerPage = options.itemsPerPage || 10; 
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
      this.graphics = new Graphics();
      this.createList();
    }
  
    private createList() {
      this.listItems = []; 
      this.graphics.clear();
      this.graphics.removeChildren();

      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = Math.min(startIndex + this.itemsPerPage, this.items.length);
  
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.items[i];
        const background = new Graphics();
        background.beginFill(i === this.activeItemIndex ? 0xffffff : 0x000000); 
        background.drawRect(0, (i - startIndex) * 20, 480, 20); // Adjust width/height as needed
        background.endFill();
  
        const labelText = this.labelKey ? item[this.labelKey] : item.toString();
        const itemLabel = new Text(labelText, {
          fill: i === this.activeItemIndex ? 0x000000 : 0xffffff,
          fontSize: 16,
        });
        itemLabel.anchor.set(0, 0.5);
        itemLabel.x = 10;
        itemLabel.y = (i - startIndex) * 20 + 10;
  
        this.graphics.addChild(background, itemLabel);
        this.listItems.push({ label: itemLabel, bg: background });
      }
    }
  
    private updateActiveItem() {
      if (this.activeItemIndex >= 0 && this.activeItemIndex < this.items.length) {
        this.createList(); // Re-render the entire list to update colors
      }
    }
  
    public setActiveItem(index: number) { 
      if (index >= 0 && index < this.items.length) {
        this.activeItemIndex = index; 
        this.updateCurrentPage(); 
        this.createList(); 

        if(this.activated.observed) {
            this.activated.next(this.items[this.activeItemIndex]);
        }
      }
    }

    public getActiveItem() {
        return this.items[this.activeItemIndex];
    }
  
    public nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.createList();
      }
    }
  
    public previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.createList();
      }
    }
  
    public getCurrentPageIndex() {
      return this.activeItemIndex; 
    }
  
    private updateCurrentPage() {
      this.currentPage = Math.ceil((this.activeItemIndex + 1) / this.itemsPerPage);
    }
  
    public getGraphics() {
      return this.graphics;
    }
}