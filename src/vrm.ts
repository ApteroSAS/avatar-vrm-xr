import {Matrix4, Object3D, Quaternion, Vector3} from "three";

require("aframe")
import {Component} from "aframe";
import {VRM, VRMHumanBones, VRMLoaderPlugin, VRMUtils} from "@pixiv/three-vrm";
import {GLTF,GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {VRMHumanBoneName} from "@pixiv/three-vrm-core/types/humanoid/VRMHumanBoneName";

export interface VRMComponent extends Component {
    avatar:  VRM,
    loader: GLTFLoader,
}





AFRAME.registerComponent("vrm",{
    schema: {
        src: {type:"model"}
    },
    init() {
        this.loader.register( ( parser ) => {

            return new VRMLoaderPlugin( parser );

        } );
        /*const sceneEl = this.el.sceneEl;
        console.log("init", sceneEl?.object3D);*/
    },
    async update(oldData: any) {
        const data = this.data;
        const modelChanged = data.src != oldData.src;
        console.log("update",data,oldData,modelChanged);

        if(modelChanged){
            //clean previous model
            //load new model
            this.removeModel()
            this.avatar = await this.loadModel(data.src);
            this.el.emit("loaded",this.avatar);
            if(this.avatar != null){
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
        this.removeModel();
        //console.log("remove");
    },
    pause() {
       // console.log("pause");
    },
    play() {
        //console.log("play");
    },
    async loadModel(path:string):Promise<VRM>{
        if(!path || path == "") return <VRM><unknown> undefined;
        const el = this.el;
        //test for the VRM environment to use

        const object3d = this.el.object3D;
        return new Promise((resolve,reject)=>{
            this.loader.load(path,(gltf:GLTF)=>{
                    const vrm = gltf.userData.vrm;
                    object3d.add( vrm.scene );
                    VRMUtils.rotateVRM0( vrm ); // 読み込んだモデルがVRM0.0の場合は回す
                    resolve(vrm);
                },
                (e)=>{
                    //Handle loading events
                    el.emit("loading",e);
                   //console.log( 'Loading model...', 100.0 * ( e.loaded / e.total ), '%' )
                },
                (e)=>{
                    el.emit("loading-error",e)
                   // console.log(e);
                    reject(e);
                }
            )
        })
    },
    async removeModel(){
        if(!this.avatar) return;
        //console.log(this.el.object3D, this.avatar);
        this.el.object3D.remove(this.avatar.scene);
        VRMUtils.deepDispose(this.avatar.scene);
        this.avatar = undefined as unknown as VRM;//.dispose(
        // );
    },
    avatar: undefined as unknown as VRM,
    loader: new GLTFLoader(),
})