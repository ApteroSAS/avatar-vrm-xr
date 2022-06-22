
import * as THREE from 'three';
import {AFrame} from "aframe";
import {loadMixamoAnimation} from "./utils/loadMixamoAnimation";
import {VRMComponent} from "./vrm"
import {VRM} from "@pixiv/three-vrm";

AFRAME.registerComponent("vrm-animation",{
    dependencies:['vrm'],
    schema: {
        defaultAnimation: {type:"asset",default:""}
    },
    events: {
        loaded:function (evt:CustomEvent){
            //console.log(evt,"animation");
            this.initAnimation()
        }
    },
    init: function () {
        const vrmComponent: VRMComponent = <VRMComponent> this.el.components.vrm;
        //console.log(vrmComponent.avatar);
    },
    update: function () {

    },
    tick: function (time,delta) {
        if(this.animationMixer)
        {
            this.animationMixer.update(delta/1000);
            //console.log(delta)
        }
    },
    remove: function () {},
    pause: function () {
        if(this.animationMixer)
            this.animationMixer.timeScale = 0;
    },
    play: function () {
        if(this.animationMixer)
            this.animationMixer.timeScale = 1;
    },
    initAnimation: async function (){
        const vrmComponent: VRMComponent = <VRMComponent> this.el.components.vrm;
        if(this.animationMixer)
            this.animationMixer.stopAllAction()

        this.animationMixer = new THREE.AnimationMixer(vrmComponent.avatar.scene);

        if(!this.el.sceneEl?.isPlaying)
            this.animationMixer.timeScale = 0;

        const clip = await loadMixamoAnimation(this.data.defaultAnimation,vrmComponent.avatar)
        this.animationMixer.clipAction(clip).play();

        //console.log(clip)
        //console.log(vrmComponent.avatar.scene.animations);
    },
    animationMixer: undefined as unknown as THREE.AnimationMixer,
})