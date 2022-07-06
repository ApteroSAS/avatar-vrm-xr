
import * as THREE from 'three';
import {AFrame} from "aframe";
import {loadMixamoAnimation} from "./utils/loadMixamoAnimation";
import {VRMComponent} from "./vrm"
import {VRM} from "@pixiv/three-vrm";

AFRAME.registerComponent("mixamo-2-vrm",{
    dependencies:['vrm'],
    schema: {
        singleAnimation: {type:"asset",default:""},
        animations:{type:"array",default:[]}
    },
    events: {
        loaded:async function (evt:CustomEvent){
            console.log(evt,"animation");
            const vrmComponent: VRMComponent = <VRMComponent> this.el.components.vrm;

            if(this.data.singleAnimation)
                this.loadAnimation(this.data.singleAnimation)
            else if(this.data.animations.length != 0){
                console.log("loadAnimations")
                for (let i = 0; i < this.data.animations.length; i++) {
                    let animation = this.data.animations[i];
                    await this.loadAnimation(animation)
                }
            }

            this.el.emit("mixamo-animation-loaded",vrmComponent.avatar.scene.animations)
        }
    },
    init: function () {
        const vrmComponent: VRMComponent = <VRMComponent> this.el.components.vrm;
        //console.log(vrmComponent.avatar);
    },
    update: function (oldData) {

    },
    remove: function () {},

    loadAnimation: async function (animationPath: string){
        const vrmComponent: VRMComponent = <VRMComponent> this.el.components.vrm;
        const clip = await loadMixamoAnimation(animationPath,vrmComponent.avatar)
        if(clip)
            vrmComponent.avatar.scene.animations.push(clip)
    }
})