


import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import FeatureLayer from "esri/layers/FeatureLayer";
import Graphic from "esri/Graphic";
import Geometry from "esri/geometry/Geometry";
import {Map, MapConstructor, SimpleEventDispatcher} from "./utils";

import {Item} from "./ItemList";


declare var Map: MapConstructor;


export interface SceneItem extends Item{
    attributes: any;

    remove(): void;
    updateGeometry( geometry: Geometry ): void;
    updateAttributes( attributes: any ): void;
}

interface FieldConfig{
    name: string;
    label: string;
}
export interface LayerInfo{
    layer: FeatureLayer;
    fieldConfig: FieldConfig[];
}

export abstract class SceneItemManager<T extends SceneItem>{
    items = new Map<number, T>(); // mapps oid->item

    constructor( public scene: SceneBase, public featureLayer: FeatureLayer ){
        this.scene.view.map.layers.add(this.featureLayer);
        // register this manager with the scene
        scene.managers.push(this);

        // add existing scene items from feature layer
        this.scene.view.whenLayerView( this.featureLayer )
            .then(()=>{
                const query = this.featureLayer.createQuery();
                query.returnZ = true;
                return this.featureLayer.queryFeatures(query);   
            })
            .then((featureSet)=>{
                featureSet.features.forEach((feature)=>{
                    const oid = (feature.getObjectId() as any) as number;
                    this.add(oid, this.create());
                    this.update(oid, feature);
                });
            });

        // listen to edits (triggered by Editor widget)
        this.featureLayer.on("edits", (edits)=>{
            const featureOidsToBeUpdated: number[] = [];

            // add created features
            edits.addedFeatures.forEach( (feature)=>{
                this.add(feature.objectId, this.create());
                featureOidsToBeUpdated.push(feature.objectId);
            } );
            // remove deleted features
            edits.deletedFeatures.forEach( (feature)=>{
                this.remove(feature.objectId);
            } );
            // update updated features
            edits.updatedFeatures.forEach((feature)=>{
                featureOidsToBeUpdated.push(feature.objectId);
            });

            this.updateItems(featureOidsToBeUpdated);
        });
    }

    get(oid: number): T{
        return this.items.get(oid);
    }

    getAll(): T[]{
        const items: T[] = [];
        this.items.forEach((item)=>{
            items.push(item);
        })
        return items;
    }

    abstract create(): T;
    abstract getLayerInfo(): LayerInfo;

    add( objectId: number, item :T ): void{
        this.items.set(objectId, item);
        this.scene.itemAdded.dispatch(item);
    }

    update( objectId: number, feature: Graphic): void {
        const item = this.get(objectId);
        item.updateGeometry(feature.geometry);
        item.updateAttributes(feature.attributes);
        this.scene.itemUpdated.dispatch(item);
    }

    remove(oid: number):void{
        const item = this.items.get(oid);
        if(item){
            item.remove();
            this.items.delete(oid);
        }
        this.scene.itemRemoved.dispatch(item);
    }

    async updateItems( oids: number[] ): Promise<{}>{
        const query = this.featureLayer.createQuery();
        query.returnZ = true;
        query.objectIds = oids;
        return this.featureLayer.queryFeatures(query).then( (featureSet)=>{
            featureSet.features.forEach((feature)=>{
                const oid = (feature.getObjectId() as any) as number;
                this.update(oid, feature);
            });    
            return {};
        })
    }

    async toJSON(): Promise<any>{
        const query = this.featureLayer.createQuery();
        query.returnZ = true;
        return this.featureLayer.queryFeatures(query).then( (featureSet)=>{
            const featuresJSON: any[] = [];
            featureSet.features.forEach((feature)=>{
                //const oid = (feature.getObjectId() as any) as number;
                //this.update(oid, feature);
                const fJSON = {geometry: feature.geometry.toJSON(), attributes: feature.attributes};
                featuresJSON.push(fJSON);
            });    
            return featuresJSON;
        })
    }
}


export class SceneBase{
    managers: SceneItemManager<SceneItem>[] = [];

    // Events
    itemAdded = new SimpleEventDispatcher<SceneItem>();
    itemRemoved = new SimpleEventDispatcher<SceneItem>();
    itemUpdated = new SimpleEventDispatcher<SceneItem>();



    constructor( public view: SceneView ){
    }


    getItem( layer: FeatureLayer, oid: number ) : SceneItem{
        for( let i=0;i<this.managers.length; ++i ) {
            const manager = this.managers[i];
            if(manager.featureLayer == layer) {
                return manager.get(oid);
            }
        }
        return null;
    }

    updateItem(layer: FeatureLayer, oid: number, geometry: Geometry, attributes: any): void{
        const item = this.getItem( layer, oid );
        item.updateGeometry(geometry);
        item.updateAttributes(attributes);
        this.itemUpdated.dispatch(item);
    }

    updateItemAttributes(layer: FeatureLayer, oid: number, attributes: any): void{
        const item = this.getItem( layer, oid );
        item.updateAttributes(attributes);
        this.itemUpdated.dispatch(item);
    }


    getAllItems(): SceneItem[]{
        let items: SceneItem[] = [];
        this.managers.forEach((manager)=>{
            items = items.concat(manager.getAll());
        })
        return items;
    }

    createItem( layer: FeatureLayer ) : SceneItem{
        for( let i=0;i<this.managers.length; ++i ) {
            const manager = this.managers[i];
            if(manager.featureLayer == layer) {
                return manager.create();
            }
        }
        return null;
    }
}