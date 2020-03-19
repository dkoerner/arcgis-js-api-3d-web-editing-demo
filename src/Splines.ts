



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

import * as THREE from "three";

export class Spline implements SceneItem{
    label = "Spline";
    attributes: any = {};
    private _curve: THREE.CatmullRomCurve3 = null;
    curveGraphic: Graphic = null; // graphic representing the actual spline curve


    constructor( public view: SceneView, public curveLayer: GraphicsLayer, public controlCurveFeatureLayer: FeatureLayer ){
    }


    updateAttributes( attributes: any ): void{
        this.attributes = {...attributes};
        if("label" in this.attributes){
            this.label = this.attributes["label"];
        }
    }

    updateGeometry( geometry: Geometry ): void{
        if(!(geometry.type == "polygon" || geometry.type == "polyline")){
            return;
        }

        let controlCurveGeometry: Polyline = null;

        // convert to polyline
        if(geometry.type == "polygon"){
            const paths = (geometry as Polygon).clone().rings;
            controlCurveGeometry = new Polyline({paths: paths, spatialReference: geometry.spatialReference});
        }else{
            controlCurveGeometry = (geometry as Polyline).clone();
        }


        // convert to absolute-height elevation mode if feature layer elevation mode is != absolute-height
        if( this.controlCurveFeatureLayer.elevationInfo.mode != "absolute-height" && controlCurveGeometry.hasZ ){
            const controlCurveGeometryElevation = this.view.groundView.elevationSampler.queryElevation(controlCurveGeometry) as Polyline;
            // controlCurveGeometryElevation z values now contain the elevation
            // we convert to absolute-height by taking the elevation and adding 
            controlCurveGeometryElevation.paths.forEach((path, pathIndex)=>{
                path.forEach((vertex, vertexIndex)=>{
                    controlCurveGeometry.paths[pathIndex][vertexIndex][2] += vertex[2];
                });
            });
        }

        const srcSpatialReference = controlCurveGeometry.spatialReference;
        const paths = controlCurveGeometry.paths;

        if(paths.length == 0){
            return;
        }

        const controlPointsMapSpace = paths[0];

        

        // convert to renderspace
        const controlPointsRenderSpace = controlPointsMapSpace.map((pathVertex) => this.toRenderSpace(pathVertex, srcSpatialReference));



        // compute spline geometry
        this._curve = new THREE.CatmullRomCurve3( controlPointsRenderSpace );
        const arcLength = this._curve.getLength();
        //const subdivisionPerUnitArcLength = .02;
        //const subdivisionPerUnitArcLength = .05;
        const subdivisionPerUnitArcLength = .1;
        const minVertexCount = 20;
        const maxVertexCount = 2000;
        const curvePointsRenderSpace = this._curve.getPoints(Math.min( maxVertexCount, Math.max(minVertexCount, Math.abs(subdivisionPerUnitArcLength*arcLength))));

        // seems to be required to have the spline reach the last vertex
        curvePointsRenderSpace.push( this.toRenderSpace(controlPointsMapSpace[controlPointsMapSpace.length-1], srcSpatialReference) );

        // convert to mapSpace
        const curvePointsMapSpace = curvePointsRenderSpace.map((curvePoint, index) => this.toMapSpace(curvePoint) );

        const curveGeometry = new Polyline({paths:[curvePointsMapSpace], spatialReference: this.view.spatialReference});

        if(this.curveGraphic == null){
            this.curveGraphic = new Graphic( {geometry: curveGeometry, symbol: Spline.createCurveSymbol()} );
            this.curveLayer.add(this.curveGraphic);
        }else{
            this.curveGraphic.geometry = curveGeometry;
        }

    }

    eval( t: number ): Point{
        const p = this.toMapSpace(this._curve.getPoint(t));
        return new Point({x:p[0], y:p[1], z:p[2], spatialReference: this.view.spatialReference});
    }


    remove(): void{
        if(this.curveGraphic != null){
            this.curveLayer.remove(this.curveGraphic);
            this.curveGraphic = null;
        }
    }


    toRenderSpace( pathVertex: number[], srcSpatialReference: SpatialReference = null ): THREE.Vector3 {
        // account for 2d geometry which doesnt have z
        const input = [pathVertex[0], pathVertex[1], pathVertex.length > 2 ? pathVertex[2] : 0];
        const result = [0,0,0];
        toRenderCoordinates( this.view, input, 0, srcSpatialReference, result, 0, 1 );
        return new THREE.Vector3( result[0], result[1], result[2] );
    };

    toMapSpace(vertex: THREE.Vector3): number[]{
        const src = [vertex.x, vertex.y, vertex.z];
        const dst = [0,0,0];
        fromRenderCoordinates( this.view, src, 0, dst, 0, this.view.spatialReference, 1 );
        return dst;
    }


    static createControlCurveSymbol(): LineSymbol3D{
        return new LineSymbol3D({
            symbolLayers: [
                new LineSymbol3DLayer({
                    size: 1,  // points
                    material: { color: "black" },
                    cap: "round",
                    join: "round"
                })
            ]
        });
    }

    static createCurveSymbol(): LineSymbol3D{
        return new LineSymbol3D({
            symbolLayers: [
                new LineSymbol3DLayer({
                    size: 3,  // points
                    material: { color: "red" },
                    cap: "round",
                    join: "round"
                })
            ]
        });
    }



}




export class Splines extends SceneItemManager<Spline>{
    curvesLayer = new GraphicsLayer({elevationInfo: {mode: "absolute-height"}});

    constructor( public scene: SceneBase, controlCurvesFeatureLayer: FeatureLayer ){
        super(scene, controlCurvesFeatureLayer);

        // spline curves
        this.scene.view.map.layers.add(this.curvesLayer);
    }

    create(): Spline{
        return new Spline(this.scene.view, this.curvesLayer, this.featureLayer);
    }

    getLayerInfo(): LayerInfo{
        return {
            layer: this.featureLayer,
            fieldConfig:[
                {
                    name: "label",
                    label: "label"
                }
            ]
        }
    }
}
