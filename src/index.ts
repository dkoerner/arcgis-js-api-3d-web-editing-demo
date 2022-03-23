import SceneView from "@arcgis/core/views/SceneView";
import Geometry from "@arcgis/core/geometry/Geometry";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

// scene
import {SceneItem} from "./Scene";
import {move} from "./Cameras";


// ui
import {ItemList} from "./ItemList";
import Expand from "@arcgis/core/widgets/Expand";
import Editor from "@arcgis/core/widgets/Editor";
import UpdateWorkflowData from "@arcgis/core/widgets/Editor/UpdateWorkflowData";
import CreateWorkflowData from "@arcgis/core/widgets/Editor/CreateWorkflowData";
import Workflow from "@arcgis/core/widgets/Editor/Workflow";

// example
import {Scene} from "./SceneLayerExample";
//import {Scene} from "./BimExample";



// credits @jkieboom@esri.com
function createFullscreen(): HTMLDivElement {
    var fullscreen = document.createElement("div");
    fullscreen.classList.add("esri-widget--button", "esri-interactive");
    var span = document.createElement("span");
    span.classList.add("esri-icon", "esri-icon-zoom-out-fixed");
    fullscreen.appendChild(span);
    fullscreen.addEventListener("click", function () {
        if(span.classList.contains("esri-icon-zoom-out-fixed")){
            span.classList.remove("esri-icon-zoom-out-fixed");
            span.classList.add("esri-icon-zoom-in-fixed");
        }else{
            span.classList.add("esri-icon-zoom-out-fixed");
            span.classList.remove("esri-icon-zoom-in-fixed");
        }
        parent.postMessage({ type: "fullscreen" }, "*");
    });
    return fullscreen;
}

class App {

    delete(): void{

    }
    private view: SceneView;
    private scene: Scene;

    // ui
    private editor: Editor;
    private itemList: ItemList<SceneItem>;

	constructor() {
        window["app"] = this;



        this.scene = new Scene();
        this.view = this.scene.view;
       

        this.scene.load( ()=>{
            this.buildUI();
        } );



        this.view.on("click", (e)=>{
            this.view.hitTest(e.screenPoint).then((hitTestResults)=>{
                const results = hitTestResults.results;
                if(results.length > 0 && results[0].graphic != null){
                    const selected = results[0].graphic;

                    // check for selected splines
                    /*
                    for(let i=0;i<this.splines.length; ++i){
                        const spline = this.splines[i];
                        if(spline.controlCurveGraphic == selected || spline.curveGraphic == selected){
                            //this.reshape(spline);
                            e.stopPropagation();
                            return;
                        }
                    }
                    */

                    // check for camera selection
                    for(let i=0;i<this.scene.cameras.length; ++i){
                        const camera = this.scene.cameras[i];
                        if(camera.cameraGraphic == selected){
                            move( this.view, this.scene.cameraLayer, camera.cameraGraphic, !camera.hasTarget);
                        }
                        if(camera.lookatGraphic == selected){
                            move( this.view, this.scene.cameraLayer, camera.lookatGraphic);
                        }
                    }
                }
            });
        });



        // Editor widget -------
        const layerinfos: any = [];
        this.scene.managers.forEach((manager)=>{
            const layerInfo = manager.getLayerInfo();
            if(layerInfo){
                layerinfos.push(layerInfo);
            }
        });

        this.editor = new Editor({
            view: this.view,
            container: document.createElement("div"),
            layerInfos: layerinfos
        });
        //this.editor.supportingWidgetDefaults.sketch.polygonSymbol
        //this.editor.supportingWidgetDefaults.sketch.defaultUpdateOptions.enableZ = false;
        //this.editor.supportingWidgetDefaults.sketch.defaultUpdateOptions
        //this.editor.viewModel.sketchViewModel.on("create", (e)=>{
        //    e.state
        //})

        let editedItem: SceneItem = null;
        let editedItemInfo: {layer: FeatureLayer, objectId: number, resetGeometry: Geometry, resetAttributes: any } = null;

        // this will initialize new features with the current payload ----
        let handle: IHandle = null;
        this.editor.watch("activeWorkflow", (activeWorkflow: Workflow)=>{

            if( handle != null ){
                handle.remove();
                handle = null;
            }

            if( activeWorkflow != null ){
                console.log("activeWorkflow:", activeWorkflow);



                handle = activeWorkflow.watch("stepId", (stepId)=>{
                    console.log("stepId:", activeWorkflow.stepId);

                    // create workflow steps ---------
                    if(stepId == "awaiting-feature-to-create" && this.editor.activeWorkflow.type == "create"){
                        // modify template to inject app specific information
                        const data = (this.editor.activeWorkflow as any).data as CreateWorkflowData;
                        data.creationInfo.template.prototype.attributes["payload"] = this.scene.encodeSceneItemPayload();
                    }

                    if(stepId == "awaiting-feature-creation-info" && this.editor.activeWorkflow.type == "create"){
                        /*
                        if(editedItem != null){
                            // we completely remove item if it was staged for creation
                            editedItem.remove();
                            editedItem = null;
                        }
                        */
                    }


                    // update workflow steps --------
                    if(stepId == "editing-existing-feature" && this.editor.activeWorkflow.type == "update"){
                        const data = (this.editor.activeWorkflow as any).data as UpdateWorkflowData;
                        const feature = data.edits.feature;
                        editedItemInfo = {
                            layer: data.editableItem.layer,
                            objectId: feature.getObjectId() as any,
                            resetGeometry: feature.geometry.clone(),
                            resetAttributes: {...feature.attributes}
                        };
                    }

                    if(stepId == "awaiting-feature-to-update"){
                        /*
                        // TODO: find out how to see if a feature has been discarded
                        // if there is an item currently specified
                        if(editedItem != null){
                            // In update workflow this means we have discared and are about to start
                            // updating (a potentially different) feature. We therefore reset the
                            // edited item to its start state before setting it to null
                            //this.scene.updateItem(editedItemInfo.layer, editedItemInfo.objectId, editedItemInfo.resetGeometry, editedItemInfo.resetAttributes);
                            editedItem = null;
                        }
                        */
                    }
                });
            }
        });


        // this will update currently created/updated features with the current payload ----
        // TODO:

        // handle attribute modification in create and update workflows ------
        this.editor.viewModel.featureFormViewModel.on("value-change", (e)=>{
            if(this.editor.activeWorkflow.type == "create"){
                // we are updating feature attributes of a feature which hasnt been created yet
                if(e.valid){
                    const updatedAttributes = {...e.feature.attributes};
                    updatedAttributes[e.fieldName] = e.value
                    editedItem.updateAttributes(updatedAttributes);
                }
            }else
            if(this.editor.activeWorkflow.type == "update"){
                // we are updating feature attributes of an existing feature
                if(e.valid){
                    const updatedAttributes = {...e.feature.attributes};
                    updatedAttributes[e.fieldName] = e.value
                    this.scene.updateItemAttributes(e.layer, e.feature.getObjectId() as any, updatedAttributes);
                }
            }
        });


        // handle geometry creation/update in create and update workflows -------
        const svm = this.editor.viewModel.sketchViewModel;
        svm.on("create", (e)=>{
            switch(e.state){
                case "start":
                    if(this.editor.activeWorkflow.type == "create"){
                        // we are creating an item which does not exist on a feature layer yet
                        const data = (this.editor.activeWorkflow as any).data as CreateWorkflowData;
                        data.creationInfo.template.prototype.attributes["payload"] = this.scene.encodeSceneItemPayload();
                        editedItem = this.scene.createItem( data.creationInfo.layer );
                        editedItem.updateAttributes(data.creationInfo.template.prototype);
                    }
                    break;
                case "active":
                    if(editedItem != null){
                        editedItem.updateGeometry(e.graphic.geometry);
                    }
                    break;
                case "complete":
                    if(editedItem != null){
                        editedItem.remove();
                        editedItem = null;
                    }
                    break;
            }
        });


        svm.on("update", (e)=>{
            console.log("svm update", e);
            switch(e.state){
                case "start":
                    const graphic = e.graphics[0];
                    if(this.editor.activeWorkflow.type == "update"){
                        // we are updating a item which already exists as a feature on the feature layer
                        const data = (this.editor.activeWorkflow as any).data as UpdateWorkflowData;
                        const oid = (graphic.getObjectId() as any) as number;
                        editedItem = this.scene.getItem( data.editableItem.layer, oid );
                    }else
                    if(this.editor.activeWorkflow.type == "create"){
                        // we are updating a item which does not exist on a feature layer yet
                        const data = (this.editor.activeWorkflow as any).data as CreateWorkflowData;
                        editedItem = this.scene.createItem( data.creationInfo.layer );
                        editedItem.updateGeometry(graphic.geometry);
                        editedItem.updateAttributes(graphic.attributes);
                    }
                    break;
                case "active":{
                        editedItem.updateGeometry(e.graphics[0].geometry);
                    }break;
                case "complete":
                    // we remove the staged scene item independent of wether creation was successfull or cancelled
                    // NB: if the item was created successfully (and not discared), then we will catch that in applyEdits
                    //   and create the item again there
                    if(this.editor.activeWorkflow.type == "create" && editedItem != null){
                        editedItem.remove();
                    }
                    editedItem = null;    
                    break;
            }
        });
    }
    



    buildUI(): void{


        // ItemList --------------
        this.itemList = new ItemList(this.scene);
        this.itemList.itemClicked.subscribe( (item)=>{
            this.scene.clickItem(item);
        } );


        /*
        // add picture in picture thingy
        const pipContainer = document.getElementById("camera-view-container") as HTMLDivElement;


        // add button ---
        const cameraButton = document.createElement("button") as HTMLButtonElement;
        cameraButton.classList.add("esri-button");
        cameraButton.id = "create-camera";
        cameraButton.title = "click and drag to place a camera";
        cameraButton.innerHTML = "create camera";
        cameraButton.addEventListener("click", ()=>{
            drawCamera( this.scene, this.scene.cameraLayer, this.scene.createView(pipContainer));
            animateButton.disabled = false;
        });


        const animateButton = document.createElement("button") as HTMLButtonElement;
        animateButton.classList.add("esri-button");
        animateButton.id = "animate";
        animateButton.title = "attach camera to first spline";
        animateButton.disabled = true;
        animateButton.innerHTML = "animate";
        animateButton.addEventListener("click", ()=>{

            const camera = this.scene.cameras[0];

            camera.animationCurve = this.scene.splines.get(1);

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
                labelsVisible: false,
                precision: 0,
                values: [initalValue]
            });


            slider.on("thumb-drag", (event)=>{
                const value = event.value;
                // map to [0,1]
                const min = slider.min;
                const max = slider.max;

                const valueMapped = (value - min) / (max - min);
                this.scene.time = valueMapped;
            });

            camera.pipView.ui.add([slider], "manual");
        });
        */



        
        const editorExpand = new Expand({
            expandTooltip: "create or update items",
            view: this.view,
            content: this.editor
        });

        // item list ----
        const itemListExpand = new Expand({
            expandTooltip: "expand list of items",
            view: this.view,
            content: this.itemList.div
        });

        this.view.ui.add(itemListExpand, "top-right");
        this.view.ui.add(createFullscreen(), "top-right");
        

        if(this.scene.name == "bim-example"){
        }else{
            const cameraPanel = document.getElementById("camera-panel") as HTMLDivElement;
            cameraPanel.style.display = null;
            this.view.ui.add(cameraPanel, "bottom-left");
        }

        // always add editor widget
        this.view.ui.add(editorExpand, "bottom-right");
    }

}











const app = new App();
