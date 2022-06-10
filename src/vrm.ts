
require("aframe")
import {VRM,VRMDebug} from "@pixiv/three-vrm";
import {GLTF,GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


AFRAME.registerComponent("vrm",{
    schema: {
        src: {type:"model"},
        debug:{default:false}
    },
    init() {
        const sceneEl = this.el.sceneEl;
        console.log("init", sceneEl?.object3D);
    },
    async update(oldData: any) {
        const data = this.data;
        const object3d = this.el.object3D;
        const modelChanged = data.src != oldData.src;
        const debugChanged = data.debug != oldData.debug;
        console.log("update",data,oldData,modelChanged);

        if(modelChanged || debugChanged){
            //clean previous model
            //load new model
            this.removeModel()
            this.avatar = await this.loadModel(data.src, data.debug);
            if(this.avatar){
                console.log(this.avatar)
            }
        }
    },
    tick(delta) {
        if(this.avatar){
            this.avatar.update(delta);
        }
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
    async loadModel(path:string,debug:boolean=false):Promise<VRM>{
        if(!path || path == "") return <VRM><unknown> undefined;
        //test for the VRM environment to use
        const thisVRM = debug? VRMDebug : VRM;
        const object3d = this.el.object3D;
        return new Promise((resolve,reject)=>{
            this.loader.load(path,(gltf:GLTF)=>{
                    thisVRM.from(gltf).then(
                        ( vrm:VRM ) => {
                            object3d.add( vrm.scene );
                            resolve(vrm);
                        }
                    )
                },
                (e)=>{
                    //Handle loading events
                    console.log( 'Loading model...', 100.0 * ( e.loaded / e.total ), '%' )
                },
                (e)=>{
                    console.log(e);
                    reject(e);
                }
            )
        })
    },
    async removeModel(){
        if(!this.avatar) return;
        console.log(this.el.object3D, this.avatar);
        this.el.object3D.remove(this.avatar.scene);
        this.avatar.dispose();
    },
    avatar: undefined as unknown as VRM,
    loader: new GLTFLoader(),
})