

import EsriMap from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import Point from "@arcgis/core/geometry/Point";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import EsriCamera from "@arcgis/core/Camera";
import Slider from "@arcgis/core/widgets/Slider";
import {mockupControlCurveLayer} from "./data";
import SimpleRenderer from "@arcgis/core//renderers/SimpleRenderer";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";

// scene
import {SceneItem, SceneBase} from "./Scene";
import {Splines, Spline} from "./Splines";
import {Camera, createCamera} from "./Cameras";


const frankfurt_scene_layer_url = "https://tiles.arcgis.com/tiles/wdgKFvvZvYZ3Biji/arcgis/rest/services/2020_09_07_Frankfurt_AdaptedThreshold/SceneServer";


export interface SceneItemPayload{
    target: Point;
};



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


export class Scene extends SceneBase{
    name = "scene-layer-example";

    cameras: Camera[] = [];
    cameraLayer = new GraphicsLayer({elevationInfo: {mode: "absolute-height"}});

    // persistet ---
    splines: Splines = null;

    // scenelayer example
    sceneLayer = new IntegratedMeshLayer({
        url: frankfurt_scene_layer_url
    });
    /*
    waterLayer = new FeatureLayer( {
        url: "https://services7.arcgis.com/wdgKFvvZvYZ3Biji/arcgis/rest/services/Frankfurt_water/FeatureServer"
    });
    */

    floorFieldName: string = "BldgLevel"; // name of the attribute which identifies the floor

    minFloor: number = 0;
    maxFloor: number = 3;
    activeFloor: number = 0;


    constructor(){
        super(createSceneView());        
    }

    load( loadedCallback: ()=>void ): void{



        this.view.camera = new EsriCamera({
            position: {
                x: 966694.262380115,
                y: 6465340.243254686,
                z: 298.9436982655898,
                spatialReference: {
                    wkid: 102100
                }
            },
            heading: 167.35435519571178,
            tilt: 56.456021044876216
        });

        this.view.map.layers.add(this.sceneLayer);

        /*
        this.waterLayer.elevationInfo = {mode: "absolute-height", offset: 1};
        this.waterLayer.renderer = new SimpleRenderer({
            symbol: new PolygonSymbol3D({
                symbolLayers: [
                    {
                        type: "water",
                        color: [79, 71,69, 0.32]
                    }
                ]
            })
        });

        this.view.map.layers.add(this.waterLayer);
        */



        this.sceneLayer.when(()=>{
            // create camera
            const cameraPosition = new Point({
                x: 966707.3360047697,
                y: 6464988.680052896,
                z: 164.38658780697733,
                spatialReference: {
                    wkid: 102100
                }
            });
            const targetPosition = new Point({
                x: 966823.3973337851,
                y: 6464889.013685285,
                z: 100,
                spatialReference: {
                    wkid: 102100
                }
            });
            const pipContainer = document.getElementById("camera-view-container") as HTMLDivElement;
            const pipView = this.createView(pipContainer);
            createCamera( this, this.cameraLayer, pipView, cameraPosition, targetPosition );
            

            loadedCallback();
        });


        // load stuff
        this.splines = new Splines( this, mockupControlCurveLayer());

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
        return JSON.stringify(this.cameras[0].target.toJSON());
    }
    
    decodeSceneItemPayload( jsonString: string ): SceneItemPayload{
        const payload = JSON.parse(jsonString);
    
        const result: SceneItemPayload = {
            target: Point.fromJSON(payload)
        };
        return result;
    }

    clickItem( item: SceneItem ): void{
        if("payload" in item.attributes){
            const payload = this.decodeSceneItemPayload(item.attributes["payload"]);
            const camera = this.cameras[0];
            camera.target = payload.target;
            camera.animationCurve = item as Spline;
        }
    }



    createView( container: HTMLDivElement): SceneView{
        const view = createSceneView(container);

        view.ui.components = [];

        // IM -------
        const layer = new IntegratedMeshLayer({
            url: frankfurt_scene_layer_url
        });

        /*
        // water --------
        const waterLayer = new FeatureLayer( {
            url: "https://services9.arcgis.com/u0sSNqDXr7puKJrF/arcgis/rest/services/FrankfurtWater/FeatureServer"
        });
    
        waterLayer.elevationInfo = {mode: "absolute-height", offset: 1};
        waterLayer.renderer = new SimpleRenderer({
            symbol: new PolygonSymbol3D({
                symbolLayers: [
                    {
                        type: "water",
                        color: [79, 71,69, 0.32]
                    }
                ]
            })
        });
        */


        const map = new EsriMap({
            basemap: "topo",
            ground: "world-elevation",
            layers: [layer]
        });

        view.map = map;

        const timeSliderContainer = document.createElement("div") as HTMLDivElement;
        timeSliderContainer.style.width = "100%";
        timeSliderContainer.style.height = "25px";
        timeSliderContainer.style.bottom = "0px";
        timeSliderContainer.style.backgroundColor = "#ffffff0f";


        const initalValue = 0;
        const slider = new Slider({
            container: timeSliderContainer,
            min: 0,
            max: 100,
            precision: 0,
            values: [initalValue]
        });


        slider.on("thumb-drag", (event)=>{
            const value = event.value;
            // map to [0,1]
            const min = slider.min;
            const max = slider.max;

            const valueMapped = (value - min) / (max - min);
            this.time = valueMapped;
        });

        view.ui.add([slider], "manual");

        return view;
    }


}









