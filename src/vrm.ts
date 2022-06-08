
require("aframe")
import {VRM} from "@pixiv/three-vrm";
import {GLTF,GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


AFRAME.registerComponent("vrm",{
    schema: {
        src: {type:"model"}
    },
    init() {
        const sceneEl = this.el.sceneEl;
        console.log("init", sceneEl?.object3D);
    },
    async update(oldData: any) {
        const data = this.data;
        const object3d = this.el.object3D;
        const modelChanged = data.src != oldData.src;
        console.log("update",data,oldData,modelChanged);
        if(modelChanged){
            //clean previous model
            //load new model
            this.avatar = await this.loadModel(data.src);
            this.removeModel()
        }
    },
    tick() {
        //console.log("tick");
    },
    remove() {
        //remove model
        console.log("remove");
    },
    pause() {
        console.log("pause");
    },
    play() {
        console.log("play");
    },
    async loadModel(path:string):Promise<VRM>{
        const object3d = this.el.object3D;
        return new Promise((resolve,reject)=>{
            this.loader.load(path,(gltf:GLTF)=>{
                    VRM.from(gltf).then(
                        ( vrm:VRM ) => {
                            // add the loaded vrm to the scene
                            object3d.add( vrm.scene );
                            // deal with vrm features




                            resolve(vrm);
                        }
                    )
                },
                (e)=>{
                    //console.log(e)
                },
                (e)=>{
                    console.log(e);
                    reject(e);
                }
            )
        })

    },
    async removeModel(){
        console.log(this.el.object3D, this.avatar);
    },
    avatar: undefined as unknown as VRM,
    loader: new GLTFLoader(),
})