import {Group, Matrix4, Object3D, Quaternion, Vector3} from "three";

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
        src: {type:"model"},
        firstPerson:{default:false}
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
        const firstPersonChanged = data.firstPerson != oldData.firstPerson;
        //console.log("update",data,oldData,modelChanged);

        if(modelChanged){
            //clean previous model
            //load new model
            this.removeModel()
            this.avatar = await this.loadModel(data.src);
            this.el.emit("loaded",this.avatar);
            if(this.avatar != null){
                //console.log(this.avatar)
            }
        }

        if(firstPersonChanged && this.avatar && this.avatar.firstPerson){
            //console.log(this.avatar.firstPerson);
            this.toggleLayer(data.firstPerson);
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
                    const vrm:VRM = gltf.userData.vrm;
                    this.el.setObject3D("avatar",vrm.scene)
                    console.log(object3d)
                    VRMUtils.rotateVRM0( vrm ); // 読み込んだモデルがVRM0.0の場合は回す
                    vrm.firstPerson?.setup();
                    resolve(vrm);
                },
                (e)=>{
                    //Handle loading events
                    el.emit("loading",e);
                },
                (e)=>{
                    el.emit("loading-error",e)
                    reject(e);
                }
            )
        })
    },
    async removeModel(){
        if(!this.avatar) return;
        this.el.removeObject3D('avatar')
        VRMUtils.deepDispose(this.avatar.scene);
        this.avatar = undefined as unknown as VRM;
    },
    avatar: undefined as unknown as VRM,
    loader: new GLTFLoader(),
    isFirstPerson:false,
    toggleLayer( set:boolean|undefined ) {
        //code boilerplated from https://github.com/pixiv/three-vrm/blob/1.0/packages/three-vrm-core/examples/firstPerson.html
        const camera = this.el.sceneEl?.camera;
        if (!camera) return;

        if ( typeof set === 'boolean' )  {
            this.isFirstPerson = set;
        } else {
            this.isFirstPerson = !this.isFirstPerson;
        }
        if ( this.avatar && this.avatar.firstPerson ) {
            const firstPerson = this.avatar.firstPerson;
            if ( this.isFirstPerson ) {
                camera.layers.enable( firstPerson.firstPersonOnlyLayer );
                camera.layers.disable( firstPerson.thirdPersonOnlyLayer );
            } else {
                camera.layers.disable( firstPerson.firstPersonOnlyLayer );
                camera.layers.enable( firstPerson.thirdPersonOnlyLayer );
            }
        }
    },
})