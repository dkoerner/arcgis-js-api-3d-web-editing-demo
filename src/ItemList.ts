import {MapConstructor, SimpleEventDispatcher} from "./utils";

declare var Map: MapConstructor;

export interface Item{
    label: string;
}

export interface ItemProvider<T extends Item>{
    itemAdded: SimpleEventDispatcher<T>;
    itemRemoved: SimpleEventDispatcher<T>;
    itemUpdated: SimpleEventDispatcher<T>;
    getAllItems(): T[];
}

interface ItemDOM{
    li: HTMLLIElement;
    a_title: HTMLAnchorElement;
}

export class ItemList<T extends Item>{

    items = new Map<Item, ItemDOM>();

    div: HTMLDivElement;
    ol: HTMLOListElement;

    itemClicked = new SimpleEventDispatcher<T>();
  

    constructor( public provider: ItemProvider<T> ){
        this.div = document.createElement("div") as HTMLDivElement;
        this.div.style.cssFloat = "left";
        this.div.classList.add("itemlist");
    
        this.ol = document.createElement("ol") as HTMLOListElement;
        this.ol.style.listStyle = "none";
        this.ol.style.margin = "0";
        this.ol.style.padding = "0";
    
        this.div.appendChild(this.ol);

        provider.getAllItems().forEach((item)=>{
            this.addItem(item);
        });
    
        provider.itemAdded.subscribe((item)=> this.addItem(item));
        provider.itemRemoved.subscribe((item)=> this.removeItem(item));
        provider.itemUpdated.subscribe((item)=> this.updateItem(item));
    }

    addItem( item: T ): void{
        const li = document.createElement("li") as HTMLLIElement;

        const itemDiv = document.createElement("div") as HTMLDivElement;
        itemDiv.classList.add("item");



        const a_title = document.createElement("a") as HTMLAnchorElement;
        a_title.classList.add("title");

        a_title.innerHTML = item.label;
        a_title.onclick = ()=>{
            this.itemClicked.dispatch(item);
        };

        itemDiv.appendChild(a_title);


        li.appendChild(itemDiv);
    
        this.ol.appendChild(li);

        this.items.set(item, {li, a_title});
    }

    removeItem( item: T ): void{
        const itemDOM = this.items.get(item);
        this.ol.removeChild(itemDOM.li);
        this.items.delete(item);
    }

    updateItem( item: T ): void{
        const itemDOM = this.items.get(item);
        itemDOM.a_title.innerHTML = item.label;
    }
}