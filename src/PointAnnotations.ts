


import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Geometry from "@arcgis/core/geometry/Geometry";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";

import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";



// scene
import {SceneItemManager, SceneItem, SceneBase, LayerInfo} from "./Scene";

function getPointAnnotationSymbol(): PointSymbol3D{
    return new PointSymbol3D({symbolLayers:[
        new IconSymbol3DLayer({
            size: 8,  // points
            resource: { primitive: "circle" },
            material: { color: "red" }
        })
    ]});
}


function getLabelSymbol(): PointSymbol3D{
    return new PointSymbol3D({
        symbolLayers:[
            new TextSymbol3DLayer({
                size: 16,
                text: "label test",
                material: { color: "black" }
            })
        ],
        verticalOffset:{
            screenLength: 20
        },
        callout:{
            type: "line",  // autocasts as new LineCallout3D()
            size: 1.5,
            color: [150, 150, 150]
        }
    });
}

function setLabelText( feature: Graphic, text: string ): void{
    if(feature == null){
        return;
    }
    const symbol = (feature.symbol as PointSymbol3D).clone();
    (symbol.symbolLayers.getItemAt(0) as TextSymbol3DLayer).text = text;
    feature.symbol = symbol;
}


export class PointAnnotation implements SceneItem{
    label = "PointAnnotation";
    attributes: any = {};

    labelGraphic: Graphic = null;

    constructor( public view: SceneView, public displayLayer: GraphicsLayer ){
    }

    remove(): void{
        if(this.labelGraphic != null ){
            this.displayLayer.remove(this.labelGraphic);
            this.labelGraphic = null;
        }
    }

    updateGeometry( geometry: Geometry ): void{
        if(this.labelGraphic == null ){
            const symbol = getLabelSymbol();
            this.labelGraphic = new Graphic({geometry: geometry, symbol});
            this.displayLayer.add(this.labelGraphic);
        }else{
            this.labelGraphic.geometry = geometry;
        }
    }

    updateAttributes( attributes: any ): void{
        this.attributes = {...attributes};
        this.label = attributes["label"];
        setLabelText(this.labelGraphic, this.label);
    }

}






export class PointAnnotations extends SceneItemManager<PointAnnotation>{
    displayLayer = new GraphicsLayer({elevationInfo: {mode: "absolute-height"}});

    constructor( public scene: SceneBase, controlCurvesFeatureLayer: FeatureLayer ){
        super(scene, controlCurvesFeatureLayer);

        // labels
        this.scene.view.map.layers.add(this.displayLayer);
    }

    create(): PointAnnotation{
        return new PointAnnotation(this.scene.view, this.displayLayer);
    }

    getLayerInfo(): LayerInfo{
        return {
            layer: this.featureLayer,
            fieldConfig:[
                {
                    name: "label",
                    label: "label"
                },
                {
                    name: "floor",
                    label: "floor"
                }
            ]
        }
    }
}

