


import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import request from "esri/request";
import {lngLatToXY} from "esri/geometry/support/webMercatorUtils";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Symbol3D from "esri/symbols/Symbol3D";

import Editor from "esri/widgets/Editor";
import Expand from "esri/widgets/Expand";

import {Map, MapConstructor, generateUID} from "./utils";

import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
import Geometry from "esri/geometry/Geometry";
import PointSymbol3D from "esri/symbols/PointSymbol3D";
import LineSymbol3D from "esri/symbols/LineSymbol3D";

import TextSymbol3DLayer from "esri/symbols/TextSymbol3DLayer";
import IconSymbol3DLayer from "esri/symbols/IconSymbol3DLayer";
import ObjectSymbol3DLayer from "esri/symbols/ObjectSymbol3DLayer";
import LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";
import PathSymbol3DLayer from "esri/symbols/PathSymbol3DLayer";

import SceneLayer from "esri/layers/SceneLayer";
import IntegratedMeshLayer from "esri/layers/IntegratedMeshLayer";

import geometryEngine from "esri/geometry/geometryEngine";
import { Polyline, SpatialReference } from "esri/geometry";
import EsriCamera from "esri/Camera";
import Slider from "esri/widgets/Slider";
import Draw from "esri/views/draw/Draw";

import FeatureLayer from "esri/layers/FeatureLayer";

import {mockupControlCurveLayer, mockupPointAnnotationsLayer} from "./data";


import {toRenderCoordinates, fromRenderCoordinates} from "esri/views/3d/externalRenderers";


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
                text: "",
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


export class PolygonAnnotation implements SceneItem{
    label = "PolygonAnnotation";
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
        if(geometry.type != "polygon"){
            return;
        }
        const polygon = geometry as Polygon;

        if(this.labelGraphic == null ){
            const symbol = getLabelSymbol();
            this.labelGraphic = new Graphic({geometry: polygon.centroid, symbol});
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






export class PolygonAnnotations extends SceneItemManager<PolygonAnnotation>{
    displayLayer = new GraphicsLayer({elevationInfo: {mode: "absolute-height"}});

    constructor( public scene: SceneBase, controlCurvesFeatureLayer: FeatureLayer ){
        super(scene, controlCurvesFeatureLayer);

        // labels
        this.scene.view.map.layers.add(this.displayLayer);
    }

    create(): PolygonAnnotation{
        return new PolygonAnnotation(this.scene.view, this.displayLayer);
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

