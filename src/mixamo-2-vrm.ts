
import * as THREE from 'three';
import {AFrame} from "aframe";
import {loadMixamoAnimation} from "./utils/loadMixamoAnimation";
import {VRMComponent} from "./vrm"
import {VRM} from "@pixiv/three-vrm";

AFRAME.registerComponent("mixamo-2-vrm",{
    dependencies:['vrm'],
    schema: {
        singleAnimation: {type:"asset",default:""},
        animations:{type:"array",default:[]},
        defaultAnimation:{default:"idle"},
        InitAnimationMixer:{default:false}
    },
    events: {
        loaded:async function (evt:CustomEvent){
            if(this.data.singleAnimation)
                this.loadAnimation(this.data.singleAnimation)
            else if(this.data.animations.length != 0){
                for (let i = 0; i < this.data.animations.length; i++) {
                    let animation = this.data.animations[i];
                    await this.loadAnimation(animation)
                }
            }
            if(this.el.components['animation-mixer']||this.data.InitAnimationMixer){
                this.el.setAttribute("animation-mixer",{
                    clip:this.data.defaultAnimation,
                    crossFadeDuration:.2
                })
                this.el.emit("model-loaded",{model:this.el.getObject3D('avatar')});
            }
            this.el.emit("mixamo-animation-loaded",{model:this.el.getObject3D('avatar')})

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
            this.el.getObject3D('avatar').animations.push(clip)
    }
})