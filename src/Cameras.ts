



import SceneView from "esri/views/SceneView";
import Point from "esri/geometry/Point";


import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
import PointSymbol3D from "esri/symbols/PointSymbol3D";
import LineSymbol3D from "esri/symbols/LineSymbol3D";

import ObjectSymbol3DLayer from "esri/symbols/ObjectSymbol3DLayer";
import LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";



import { Polyline } from "esri/geometry";
import EsriCamera from "esri/Camera";
import Draw from "esri/views/draw/Draw";




// scene
import {Spline} from "./Splines";
import {baseURL, Vec2} from "./utils";






export class Camera{
    cameraGraphic: Graphic = null;
    lookatGraphic: Graphic = null;
    lineOfSightGraphic: Graphic = null;

    private _animationCurve: Spline = null;
    private _time: number = 0;
    private _pipView: SceneView = null;

    constructor( public view: SceneView, public layer: GraphicsLayer, initialPosition: Point ){
        this.view.map.add(this.layer);

        this.cameraGraphic = new Graphic({geometry: initialPosition.clone(), symbol: Camera.getCameraSymbol()});
        this.layer.add(this.cameraGraphic);

        this.cameraGraphic.watch("geometry", (geometry)=>{
            this.updateLineOfSight();
            this.updateOrientation();
        })
    }

    get pipView(): SceneView{
        return this._pipView;
    }
    set pipView( pipView: SceneView ){
        this._pipView = pipView;
        pipView.camera = this.esriCamera;
    }

    get time(): number{
        return this._time;
    }

    set time(time: number){
        this._time = time;
        this.updatePositionFromAnimation();
    }

    set animationCurve( curve: Spline ){
        this._animationCurve = curve;
        this._animationCurve.curveGraphic.watch("geometry", ()=>{
            this.updatePositionFromAnimation();
        });
        this.updatePositionFromAnimation();
    }

    get hasTarget(): boolean{
        return this.lookatGraphic != null;
    }

    get isAnimated(): boolean{
        return this._animationCurve != null;
    }

    get position(): Point{
        return this.cameraGraphic.geometry as Point;
    }
    set position(value: Point){
        this.cameraGraphic.geometry = value;
    }

    get target(): Point{
        if(this.lookatGraphic != null){
            return this.lookatGraphic.geometry as Point;
        }
        return null;
    }
    set target(value: Point){
        if(this.lookatGraphic == null){
            this.lookatGraphic = new Graphic({geometry: value, symbol: Camera.getLookAtSymbol()});
            this.layer.add(this.lookatGraphic);
            this.lookatGraphic.watch("geometry", (geometry)=>{
                this.updateLineOfSight();
                this.updateOrientation();
            });
            this.updateLineOfSight();
            this.updateOrientation();
        }else{
            this.lookatGraphic.geometry = value;
        }
    }

    get esriCamera(): EsriCamera{
        const symbol = this.cameraGraphic.symbol as PointSymbol3D;
        const symbolLayer = symbol.symbolLayers.getItemAt(0) as ObjectSymbol3DLayer;
        return new EsriCamera({position: this.position, heading: symbolLayer.heading, tilt:symbolLayer.tilt + 90});
    }

    updatePositionFromAnimation(): void{
        if(this._animationCurve != null){
            this.cameraGraphic.geometry = this._animationCurve.eval(this.time);
        }
    }

    updateLineOfSight(): void{
        if( this.lookatGraphic ){
            const position = this.cameraGraphic.geometry as Point;
            const target = this.lookatGraphic.geometry as Point;
            const geometry = new Polyline({paths:[[[position.x, position.y, position.z], [target.x, target.y, target.z]]], spatialReference: this.view.spatialReference});
    
    
            if(this.lineOfSightGraphic == null){
                this.lineOfSightGraphic = new Graphic({geometry: geometry, symbol: Camera.getLineOfSightSymbol()});
                this.layer.add(this.lineOfSightGraphic);
            }else{
                this.lineOfSightGraphic.geometry = geometry;
            }
        }      
    }

    updateOrientation(): void{
        if( this.lookatGraphic ){
            const position = this.cameraGraphic.geometry as Point;
            const target = this.lookatGraphic.geometry as Point;


            // compute heading
            const p0 = Vec2.from(position);
            const p1 = Vec2.from(target);
            const d = Vec2.subtract(p1, p0);
            const distance_b = d.length();
            d.normalize();
            const cos = Vec2.dot(d, Vec2.create(0,1));
            const angle = Math.acos(cos);
            const heading = d.x > 0 ? angle/Math.PI*180 : ((2-angle/Math.PI)*180);

            // compute tilt
            const height = position.z - target.z;
            const distance_a = Math.abs(height);
            const distance_c = Math.sqrt(distance_a*distance_a + distance_b*distance_b);
            const tiltAngle = Math.acos(distance_a/distance_c);
            const tilt = height > 0 ? (-0.5 + tiltAngle / Math.PI) * 180 : (0.5 - tiltAngle / Math.PI) * 180;

            // update symbol            
            const symbol = (this.cameraGraphic.symbol as PointSymbol3D).clone();
            const symbolLayer = symbol.symbolLayers.getItemAt(0) as ObjectSymbol3DLayer;
            symbolLayer.heading = heading;
            symbolLayer.tilt = tilt;

            this.cameraGraphic.symbol = symbol;            
        }

        if(this._pipView != null){
            this._pipView.camera = this.esriCamera;
        }
    }


    remove(): void{
        // TODO:
    }


    static getCameraSymbol(): PointSymbol3D{
        return new PointSymbol3D({symbolLayers:[new ObjectSymbol3DLayer({
            width: 15,
            material: {
                color: "gray"
            },
            resource:{
                href: baseURL() + "/camera-gizmo.glb"
            }
        })]});
    }

    static getLookAtSymbol(): PointSymbol3D{
        return new PointSymbol3D({symbolLayers:[new ObjectSymbol3DLayer({
            width: 15,
            material: {
                color: "green"
            },
            resource:{
                primitive: "sphere"
            }
        })]});
    }

    static getLineOfSightSymbol(): LineSymbol3D{
        return new LineSymbol3D({symbolLayers:[new LineSymbol3DLayer({
            size: 2,
            material: {
                color: "green"
            },
            cap:"round"
        })]});
    }

}





export function move( view: SceneView, cameraLayer: GraphicsLayer, graphic: Graphic, enableRotation = false ): void{
    const svm = new SketchViewModel({
        view: view,
        layer: cameraLayer
    });
    svm.update(graphic, {tool:"transform", enableRotation: enableRotation, enableScaling: false});
    const handle = svm.on("update", (e)=>{
        if(e.state == "complete"){
            svm.destroy();
            handle.remove();
        }
    });
}



export function createCamera(
    scene: any,
    cameraLayer: GraphicsLayer,
    pipView: SceneView,
    position: Point,
    target: Point ): void{
    const view = scene.view;

    const camera = new Camera(view, cameraLayer, position);
    camera.position = position;
    camera.target = target;
    scene.cameras.push(camera);
    if(pipView != null){
        camera.pipView = pipView;
        pipView.container.style.display = null;    
    }
}

export function drawCamera( scene: any, cameraLayer: GraphicsLayer, pipView: SceneView ): void{
    const view = scene.view;

    const draw = new Draw({ view: view });
    const action = draw.create("circle", { 
        mode: "hybrid", 
        elevationInfo: cameraLayer.elevationInfo, 
        defaultZ: 100, 
        hasZ: true
    });

    let camera: Camera = null;
    let startPoint: Point = null;

    action.on("vertex-add", (event) => {
        if( event.vertexIndex == 0 ){
            // first vertex (camera target)
            const vertex = event.vertices[event.vertexIndex];
            startPoint = new Point( {x:vertex[0], y:vertex[1], z:vertex[2], spatialReference: view.spatialReference} );
            camera = new Camera(view, cameraLayer, startPoint);
        }else{
            // second vertex (camera position)
            const vertex = event.vertices[event.vertexIndex];
            camera.target = startPoint;
            camera.position = new Point( {x:vertex[0], y:vertex[1], z:vertex[2], spatialReference: view.spatialReference} );
        }
    });

    action.on("cursor-update", (event) => {
        const vertices = event.vertices;
        if (vertices.length === 2) {
            const vertex = vertices[vertices.length - 1];
            camera.position = new Point( {x:vertex[0], y:vertex[1], z:vertex[2], spatialReference: view.spatialReference} );
            camera.target = startPoint;

        }
    });

    action.on("draw-complete", (event) => {
        if(camera.lookatGraphic == null){
            // no target was specified
            console.log("TODO!!!!!!");
        }
        scene.cameras.push(camera);
        camera.pipView = pipView;

        // TODO: make pipview visible
        pipView.container.style.display = null;
        //document.getElementById("camera-")

        draw.destroy();
    });
}

