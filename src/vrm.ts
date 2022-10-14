import {Group, Matrix4, Object3D, Quaternion, Vector3} from "three";

require("aframe")
import {Component,THREE} from "aframe";
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
        firstPerson:{default:false},
        //If the avatar blinks regularly
        repeatedBlinking:{default:true},
        //interval in seconds between blinks
        BlinkingInterval:{default:5}
    },
    init() {
        this.loader.register( ( parser ) => {

            return new VRMLoaderPlugin( parser );

        } );
        /*const sceneEl = this.el.sceneEl;
        console.log("init", sceneEl?.object3D);*/
        this.updateBlink = this.updateBlink.bind(this)
    },
    async update(oldData: any) {
        const data = this.data;
        const changes = AFRAME.utils.diff(data, oldData);
        console.log(changes)

        if('src' in changes){
            //clean previous model
            //load new model
            this.removeModel()
            this.avatar = await this.loadModel(data.src);
            this.el.emit("loaded",this.avatar);
        }
        if('firstPerson' in changes && this.avatar && this.avatar.firstPerson){
            //console.log(this.avatar.firstPerson);
            this.toggleLayer(data.firstPerson);
        }

        if(('BlinkingInterval' in changes || 'repeatedBlinking' in changes)){
            this.updateBlink()
        }
    },
    updateBlink(){
        if (!this.avatar || !this.avatar.expressionManager) return;
        const expressionManager = this.avatar.expressionManager;
        console.log(expressionManager)
        console.log(expressionManager.getExpression(expressionManager.blinkExpressionNames[0]))

        const trackName = expressionManager.getExpressionTrackName( expressionManager.blinkExpressionNames[0] );
        if(!trackName)return;

        const track = new THREE.NumberKeyframeTrack(
            trackName,
            [ 0.0, 0.5, 1.0 ], // times
            [ 0.0, 1.0, 0.0 ] // values
        );

        const clip = new THREE.AnimationClip(
            'blink', // name
            1.0, // duration
            [ track ] // tracks
        );

        this.mixer = new THREE.AnimationMixer( this.avatar.scene );
        const action = this.mixer.clipAction( clip );
        action.play();
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
                    // calling these functions greatly improves the performance
                    VRMUtils.removeUnnecessaryVertices( gltf.scene );
                    VRMUtils.removeUnnecessaryJoints( gltf.scene );

                    this.el.setObject3D("avatar",vrm.scene)
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
    mixer:undefined as unknown as THREE.AnimationMixer,
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