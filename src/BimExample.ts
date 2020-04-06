

import EsriMap from "esri/Map";
import SceneView from "esri/views/SceneView";
import request from "esri/request";
import {lngLatToXY} from "esri/geometry/support/webMercatorUtils";
import Point from "esri/geometry/Point";
import Polygon from "esri/geometry/Polygon";
import Symbol3D from "esri/symbols/Symbol3D";
import Geometry from "esri/geometry/Geometry";


import Editor from "esri/widgets/Editor";
import Expand from "esri/widgets/Expand";

import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
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
import BuildingSceneLayer from "esri/layers/BuildingSceneLayer";
import WebScene from "esri/WebScene";

import {mockupControlCurveLayer, mockupPointAnnotationsLayer, mockupPolygonAnnotationsLayer} from "./data";


import {toRenderCoordinates, fromRenderCoordinates} from "esri/views/3d/externalRenderers";

import BuildingFilter from "esri/layers/support/BuildingFilter";



// scene
import {SceneItem, SceneBase} from "./Scene";
import {Splines, Spline} from "./Splines";
import {Camera} from "./Cameras";
import {PointAnnotations} from "./PointAnnotations";
import {PolygonAnnotations} from "./PolygonAnnotations";

// editor
import UpdateWorkflowData from "esri/widgets/Editor/UpdateWorkflowData";
import CreateWorkflowData from "esri/widgets/Editor/CreateWorkflowData";
import Workflow from "esri/widgets/Editor/Workflow";

// ui
import {ItemList} from "./ItemList";


import * as THREE from "three";
import { Layers, Color, Vector3, NumberKeyframeTrack } from "three";
import { SimpleMarkerSymbol } from "esri/symbols";

import {baseURL, Vec2} from "./utils";







export interface SceneItemPayload{
    activeFloor: number;
    camera: EsriCamera;
};


export class Scene extends SceneBase{
    name = "bim-example";

    cameras: Camera[] = [];
    cameraLayer = new GraphicsLayer({elevationInfo: {mode: "absolute-height"}});

    // persistet ---
    //splines: Splines = null;
    pointAnnotations: PointAnnotations = null;
    polygonAnnotations: PolygonAnnotations = null;

    // bim example
    bimLayer = new BuildingSceneLayer({
        url:
            //"https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/BSL__4326__US_Redlands__EsriAdminBldg_PublicDemo/SceneServer",
            "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/Turanga_Library/SceneServer",
        //title: "Administration Building, Redlands - Building Scene Layer"
        title: "Tungsten Library, Christchurch, NZ - Building Scene Layer"
    });
    floorFieldName: string = "BldgLevel"; // name of the attribute which identifies the floor

    minFloor: number = 0;
    maxFloor: number = 0;
    _activeFloor: number = 0;
    get activeFloor(): number{
        return this._activeFloor;
    }
    set activeFloor( value: number ){
        this._activeFloor = value;
        // set filter
        const buildingFilter = new BuildingFilter({
            filterBlocks: [
              // the first filter block displays the active level with original textures
              // using `solid` filter mode
              {
                filterExpression:
                this.floorFieldName + " = " + this._activeFloor.toString(),
                filterMode: {
                  type: "solid"
                }
              },
              // the second filter block displays the levels below the active level faded out
              // using `x-ray` filter mode
              {
                filterExpression:
                  this.floorFieldName + " < " + this._activeFloor.toString(),
                filterMode: {
                    type: "x-ray"
                }
              }
            ]
        });
        // set the filter in the filters array on the layer
        this.bimLayer.filters = [buildingFilter];
        // specify which filter is the one that should be applied
        this.bimLayer.activeFilterId = buildingFilter.id;
    }



    constructor(){
        super(createSceneView());
    }

    load( loadedCallback: ()=>void ): void{

        this.view.camera = new EsriCamera({
            position: {
                //x: -13046427.303775102,
                //y: 4036595.645624613,
                //z: 430.53017157688737,
                // redlands admin building
                //x: -13045103.54643966,
                //y: 4036777.3188664303,
                //z: 445.823927924037,
                // christchurch
                x: 19218012.934741594,
                y: -5393079.987616428,
                z: 63.785132102668285,
                spatialReference: {
                    wkid: 102100
                }
            },
            //heading: 50.52948875350955,
            //tilt: 62.13243590814265
            // redlands admin building
            //heading: 318.36986922376934,
            //tilt: 61.561182587502586
            // christchurch
            heading: 304.2051779069086,
            tilt: 61.60225175907014
        });


        this.view.map.layers.add(this.bimLayer);



        this.bimLayer.when(()=>{


            // the BuildingSceneLayer contains some layers which hide all the floor geometry
            // since we want to look inside the building, we will disable those
            this.bimLayer.allSublayers.forEach(function(layer) {
                // modelName is standard accross all BuildingSceneLayer,
                // use it to identify a certain layer
                switch (layer.modelName) {
                    // Because of performance reasons, the Full Model view is
                    // by default set to false. In this scene the Full Model should be visible.
                    case "FullModel":
                        layer.visible = true;
                        break;
                    case "Overview":
                        // the Overview layer contains the hull and roof which will obscure the interior geometry
                        // this is why we make those invisible
                        layer.visible = false;
                        break;
                    case "Roofs":
                    case "Walls":
                    case "Rooms":
                    case "Doors":
                    case "StructuralColumns":
                    case "Floors":
                    case "Furniture":
                        layer.visible = true;
                        break;
                    case "CurtainWallPanels":
                    case "CurtainWallMullions":
                    case "Ceilings":
                        layer.visible = false;
                        break;
                    default:
                        layer.visible = true;
                }
            });



            this.bimLayer.summaryStatistics.load().then(()=>{
                const fieldStatistics = this.bimLayer.summaryStatistics.fields;
                let i = 0;
                let levelStats = null;
                while (!levelStats) {
                    if (fieldStatistics[i].fieldName === this.floorFieldName) {
                        levelStats = fieldStatistics[i];
                        // initially use the middle level to filter the building
                        this.minFloor = levelStats.min;
                        this.maxFloor = levelStats.max;
                        this.activeFloor = Math.round(levelStats.max / 2);
                    }
                    i++;
                }

                this.buildUI();
                loadedCallback();
            });
        });


        // load stuff
        //this.splines = new Splines( this, mockupControlCurveLayer());
        this.pointAnnotations = new PointAnnotations( this, mockupPointAnnotationsLayer());
        this.polygonAnnotations = new PolygonAnnotations( this, mockupPolygonAnnotationsLayer());

        // cameras
        this.view.map.layers.add(this.cameraLayer);


    }



    private _time = 0;
    get time(): number{
        return this._time;
    }
    set time(value: number){
        this._time = value;
        this.cameras.forEach((camera)=>{
            camera.time = value;
        });
    }


    encodeSceneItemPayload(): string{
        const payload = {
            activeFloor: this.activeFloor,
            cameraJSON: this.view.camera.toJSON()
        };
        return JSON.stringify(payload);
    }
    
    decodeSceneItemPayload( jsonString: string ): SceneItemPayload{
        const payload = JSON.parse(jsonString);
    
        const result: SceneItemPayload = {
            activeFloor: payload.activeFloor,
            camera: EsriCamera.fromJSON(payload.cameraJSON)
        };
        return result;
    }

    clickItem( item: SceneItem ): void{
        if("payload" in item.attributes){
            const payload = this.decodeSceneItemPayload(item.attributes["payload"]);
            //const floor = payload.activeFloor;
            const floor = item.attributes["floor"];
            this.activeFloor = floor;

            // update gui
            this.floorSlider.values = [this.activeFloor];
            this.view.goTo( payload.camera );
        }
    }
    




    /*
    createView( container: HTMLDivElement): SceneView{
        const view = createSceneView(container);

        view.ui.components = [];

        const layer = new BuildingSceneLayer({
            url:
                "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/BSL__4326__US_Redlands__EsriAdminBldg_PublicDemo/SceneServer",
            title: "Administration Building, Redlands - Building Scene Layer"
        });
        const map = new EsriMap({
            basemap: "topo",
            ground: "world-elevation",
            layers: [layer]
        });
        view.map = map;

        return view;
    }
    */


    private floorSlider: Slider;
    buildUI(){
        const floorNumbers: number[] = [];
        for( let i=this.minFloor;i<=this.maxFloor; ++i ){
            floorNumbers.push(i);
        }


        const bimUIPanel = document.createElement("div") as HTMLDivElement;
        bimUIPanel.id = "bim-panel";
        bimUIPanel.classList.add("esri-widget");
        bimUIPanel.style.padding = "0.8em";


        const bimPanelText = document.createElement("p") as HTMLParagraphElement;
        bimPanelText.innerHTML = "floor";
        bimPanelText.style.paddingLeft = "20px";
        bimPanelText.style.paddingRight = "20px";
        bimUIPanel.appendChild(bimPanelText);

        const floorSliderContainer = document.createElement("div") as HTMLDivElement;
        bimUIPanel.appendChild(floorSliderContainer);

        floorSliderContainer.style.height = "200px";
        floorSliderContainer.style.margin = "1em 0 1em -20px";
        floorSliderContainer.style.background = "transparent";
        this.floorSlider = new Slider({
            container: floorSliderContainer,
            min: this.minFloor,
            max: this.maxFloor,
            precision: 0,
            layout: "vertical",
            steps: 1,
            tickConfigs: [
                {
                    mode: "position",
                    values: floorNumbers,
                    labelsVisible: true
                }
            ],
            values: [this.activeFloor]
        });


        this.floorSlider.on("thumb-drag", (event)=>{
            const newFloor = event.value;
            this.activeFloor = newFloor;
        });

        this.view.ui.add([bimUIPanel], "bottom-left");
    }
}






function createSceneView( container: HTMLDivElement = document.getElementById("sceneview-container") as HTMLDivElement ): SceneView{
    const map = new EsriMap({
        basemap: "topo",
        ground: "world-elevation",
        layers: []
    });
    const view = new SceneView({
        map:map,
        environment: {
            //background: {
            //    type: "color",
            //    color: [55, 52, 44, 1]
            //},
            starsEnabled: false,
            atmosphereEnabled: true
        },
        ui:{
            components: ["attribution"]
        },
        container: container,
        viewingMode: "global",
        qualityProfile: "high"
    });
    return view;    
}








