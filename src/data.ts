import FeatureLayer from "esri/layers/FeatureLayer";
import { SimpleRenderer } from "esri/renderers";

import Graphic from "esri/Graphic";

import PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");



import PointSymbol3D from "esri/symbols/PointSymbol3D";
import LineSymbol3D from "esri/symbols/LineSymbol3D";
import LineSymbol3DLayer from "esri/symbols/LineSymbol3DLayer";
import IconSymbol3DLayer from "esri/symbols/IconSymbol3DLayer";

function createControlCurveSymbol(): LineSymbol3D{
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

function getPolygonAnnotationSymbol(): SimpleFillSymbol | PolygonSymbol3D{
    //return new SimpleFillSymbol();
    return new PolygonSymbol3D({
        symbolLayers: [{
            type: "fill",  // autocasts as new FillSymbol3DLayer()
            material: {
                color: [255, 50, 51, 0.4]
            },
            outline: {
                color: "black",
                size: "1px"
            }
        }]
    });
}


function getPointAnnotationSymbol(): PointSymbol3D{
    return new PointSymbol3D({symbolLayers:[
        new IconSymbol3DLayer({
            size: 8,  // points
            material: {
                color: [255, 50, 51, 0.4]
            },
            outline: {
                color: "black",
                size: "1px"
            }
        })
    ]});
}

export function mockupControlCurveLayer(): FeatureLayer{


    const a = [{"geometry":{type: "polyline", "hasZ":true,"spatialReference":{"latestWkid":3857,"wkid":102100},"paths":[[[966727.2623780279,6464995.646654157,110.26155186444521],[966667.3354162958,6464870.3248822475,154.6529075568542],[966770.6685053011,6464729.163696627,169.31745547894388],[966940.4283295692,6464826.216097421,167.5510607128963],[966942.8628542367,6464926.448608506,158.035329551436],[966880.0551065693,6465004.579115311,141.06792043615133],[966786.4377706631,6465021.770193718,117.25648824404925]]]},"attributes":{"ObjectID":1,"label":"church","payload":"{\"spatialReference\":{\"wkid\":102100},\"x\":966823.3973337851,\"y\":6464889.013685285,\"z\":100}"}}];
    const b =[
        {
            "geometry": {
                "type": "polyline",
                "hasZ": true,
                "spatialReference": {
                    "latestWkid": 3857,
                    "wkid": 102100
                },
                "paths": [
                    [
                        [
                            966727.2623780279,
                            6464995.646654157,
                            110.26155186444521
                        ],
                        [
                            966667.3354162958,
                            6464870.3248822475,
                            154.6529075568542
                        ],
                        [
                            966770.6685053011,
                            6464729.163696627,
                            169.31745547894388
                        ],
                        [
                            966940.4283295692,
                            6464826.216097421,
                            167.5510607128963
                        ],
                        [
                            966942.8628542367,
                            6464926.448608506,
                            158.035329551436
                        ],
                        [
                            966880.0551065693,
                            6465004.579115311,
                            141.06792043615133
                        ],
                        [
                            966786.4377706631,
                            6465021.770193718,
                            117.25648824404925
                        ]
                    ]
                ]
            },
            "attributes": {
                "ObjectID": 1,
                "label": "church",
                "payload": "{\"spatialReference\":{\"wkid\":102100},\"x\":966823.3973337851,\"y\":6464889.013685285,\"z\":100}"
            }
        },
        {
            "geometry": {
                "type": "polyline",
                "hasZ": true,
                "spatialReference": {
                    "latestWkid": 3857,
                    "wkid": 102100
                },
                "paths": [
                    [
                        [
                            967836.1218690132,
                            6465273.006112495,
                            97.1256841281429
                        ],
                        [
                            967884.441191067,
                            6464994.389303962,
                            106.30304229352623
                        ],
                        [
                            967933.9479463615,
                            6464776.343187709,
                            115.79676405526698
                        ],
                        [
                            967981.8563736466,
                            6464713.881512219,
                            214.20615399070084
                        ],
                        [
                            968002.7624888663,
                            6464687.649509539,
                            225.7532887426205
                        ],
                        [
                            967995.3667924441,
                            6464583.149436118,
                            129.98068331182003
                        ],
                        [
                            967993.7743413721,
                            6464508.902771849,
                            130.19618115574121
                        ],
                        [
                            967975.3868797059,
                            6464463.907279795,
                            117.50912282522768
                        ],
                        [
                            967941.2848767888,
                            6464499.908294601,
                            115.10360560193658
                        ]
                    ]
                ]
            },
            "attributes": {
                "ObjectID": 2,
                "label": "tower",
                "payload": "{\"spatialReference\":{\"wkid\":102100},\"x\":968001.2064608899,\"y\":6464684.64364626,\"z\":179.17846357729286}"
            }
        },
        {
            "geometry": {
                "type": "polyline",
                "hasZ": true,
                "spatialReference": {
                    "latestWkid": 3857,
                    "wkid": 102100
                },
                "paths": [
                    [
                        [
                            967385.3474771685,
                            6465033.114862103,
                            101.21207924187183
                        ],
                        [
                            967357.8153575902,
                            6465320.278564328,
                            200.2356843231246
                        ],
                        [
                            967126.8542242819,
                            6465445.90657288,
                            292.4424694972113
                        ],
                        [
                            966845.7128216656,
                            6465300.343598669,
                            159.5636027334258
                        ],
                        [
                            966833.0560499161,
                            6465166.467179871,
                            109.68125836830586
                        ]
                    ]
                ]
            },
            "attributes": {
                "ObjectID": 3,
                "label": "bridge",
                "payload": "{\"spatialReference\":{\"wkid\":102100},\"x\":967117.5310267736,\"y\":6465053.436887951,\"z\":102.01443701330572}"
            }
        }
    ];

    const features = b;
    //features.push(a[0]);
      
    const controlCurves = new FeatureLayer({
        source: features,
        renderer: new SimpleRenderer({symbol:createControlCurveSymbol()}),
        objectIdField: "ObjectID",
        outFields: ["*"],
        geometryType: "polyline",
        spatialReference: {
            wkid: 102100
        },
        fields: [
            {
                name: "ObjectID",
                type: "oid"
            },
            {
                name: "label",
                type: "string",
                defaultValue: ""
            },
            {
                name: "payload",
                type: "string",
                defaultValue: "{}"
            }
        ],
        elevationInfo: {mode: "absolute-height"},
        //elevationInfo: {mode: "relative-to-scene"},
        hasZ: true
    });


    return controlCurves;
}




export function mockupPolygonAnnotationsLayer(): FeatureLayer{

    const features = [
        {
            geometry: {
                type: "polygon",
                hasZ: true,
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                rings: [
                    [
                        [
                            19217876.760354478,
                            -5393002.970523333,
                            31.28535285592079
                        ],
                        [
                            19217877.01326432,
                            -5392991.800032023,
                            31.28535285592079
                        ],
                        [
                            19217884.94973673,
                            -5392992.204076632,
                            31.28535285592079
                        ],
                        [
                            19217884.593554057,
                            -5393004.048039467,
                            31.28535285592079
                        ],
                        [
                            19217876.760354478,
                            -5393002.970523333,
                            31.28535285592079
                        ]
                    ]
                ]
            },
            attributes: {
                ObjectID: 1,
                label: "cleanup this space",
                floor: 7,
                payload: "{\"activeFloor\":7,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217854.771936584,\"y\":-5393044.020267442,\"z\":62.844063609838486},\"heading\":31.69392227253801,\"tilt\":46.896296459835156}}"
            }
        },
        {
            geometry: {
                type: "polygon",
                hasZ: true,
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                rings: [
                    [
                        [
                            19217916.13918399,
                            -5392996.587330811,
                            10.993463165126741
                        ],
                        [
                            19217909.935894243,
                            -5392996.481199406,
                            10.993463165126741
                        ],
                        [
                            19217910.63157843,
                            -5392990.261075182,
                            10.993463166058064
                        ],
                        [
                            19217916.667029668,
                            -5392990.138467617,
                            10.993463165126741
                        ],
                        [
                            19217916.13918399,
                            -5392996.587330811,
                            10.993463165126741
                        ]
                    ]
                ]
            },
            attributes: {
                ObjectID: 3,
                label: "prepare area for art exhibition",
                floor: 2,
                payload: "{\"activeFloor\":2,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217908.03229506,\"y\":-5393006.696851547,\"z\":17.58430082537234},\"heading\":24.01682505226527,\"tilt\":61.28988126042055}}"
            }
        }
    ];

    

    const polygonAnnotations = new FeatureLayer({
        title: "area annotation",
        source: features,
        geometryType: "polygon",
        spatialReference: {
            wkid: 102100
        },
        renderer: new SimpleRenderer({symbol:getPolygonAnnotationSymbol()}),
        objectIdField: "ObjectID",
        outFields: ["*"],
        fields: [
            {
                name: "ObjectID",
                type: "oid"
            },
            {
                name: "label",
                type: "string",
                defaultValue: ""
            },
            {
                name: "floor",
                type: "integer",
                defaultValue: 0
            },
            {
                name: "payload",
                type: "string",
                defaultValue: "{}"
            }
        ],
        elevationInfo: {mode: "absolute-height"},
        hasZ: true
    });


    return polygonAnnotations;
}

export function mockupPointAnnotationsLayer(): FeatureLayer{


    const features = [
        {
            geometry: {
                type: "point",
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                x: 19217932.525376216,
                y: -5393015.539379302,
                z: 18.19316692557186
            },
            attributes: {
                ObjectID: 1,
                label: "out of service",
                floor: 4,
                payload: "{\"activeFloor\":4,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217930.368655637,\"y\":-5393016.560506998,\"z\":20.85097479261458},\"heading\":69.22666739635041,\"tilt\":30.729945183381567}}"
            }
        },
        {
            geometry: {
                type: "point",
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                x: 19217858.608012177,
                y: -5393013.701136836,
                z: 11.369978753849864
            },
            attributes: {
                ObjectID: 2,
                label: "chair is broken",
                floor: 2,
                payload: "{\"activeFloor\":2,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217854.962134216,\"y\":-5393011.261169908,\"z\":14.156350567936897},\"heading\":124.4190966724694,\"tilt\":49.92131652604984}}"
            }
        },
        {
            geometry: {
                type: "point",
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                x: 19217917.586651713,
                y: -5393013.491416072,
                z: 11.805857517756522
            },
            attributes: {
                ObjectID: 3,
                label: "tab is not working properly",
                floor: 2,
                payload: "{\"activeFloor\":2,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217915.62607714,\"y\":-5393009.327107981,\"z\":13.660603593103588},\"heading\":154.87859533943296,\"tilt\":57.85159388309063}}"
            }
        },
        {
            geometry: {
                type: "point",
                spatialReference: {
                    latestWkid: 3857,
                    wkid: 102100
                },
                x: 19217851.44220278,
                y: -5392995.566271134,
                z: 11.411878223530948
            },
            attributes: {
                ObjectID: 4,
                label: "what are these cubes about?",
                floor: 2,
                payload: "{\"activeFloor\":2,\"cameraJSON\":{\"position\":{\"spatialReference\":{\"latestWkid\":3857,\"wkid\":102100},\"x\":19217852.392227482,\"y\":-5392988.496369267,\"z\":14.072521711699665},\"heading\":188.4509352519618,\"tilt\":63.90100944339568}}"
            }
        }
    ];

      

    const pointAnnotations = new FeatureLayer({
        title: "point annotation",
        source: features,
        geometryType: "point",
        spatialReference: {
            wkid: 102100
        },
        renderer: new SimpleRenderer({symbol:getPointAnnotationSymbol()}),
        objectIdField: "ObjectID",
        outFields: ["*"],
        fields: [
            {
                name: "ObjectID",
                type: "oid"
            },
            {
                name: "label",
                type: "string",
                defaultValue: ""
            },
            {
                name: "floor",
                type: "integer",
                defaultValue: 0
            },
            {
                name: "payload",
                type: "string",
                defaultValue: "{}"
            }
        ],
        elevationInfo: {mode: "absolute-height"},
        hasZ: true
    });

    return pointAnnotations;
}








//----------------------------------
//  unique id
//----------------------------------
let _uid_counter = 1;
export function generateUID(): number{
    return _uid_counter++;
}
