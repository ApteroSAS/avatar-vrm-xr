import * as events from "events";

require("aframe")
import {Component} from "aframe";
import {VRM,VRMDebug} from "@pixiv/three-vrm";

AFRAME.registerComponent("vrm-animation",{
    dependencies:['vrm'],
    schema: {},
    events: {
        loaded:function (evt:CustomEvent){
            console.log(evt,"animation");
        }
    },
    init: function () {
        const vrmComponent = this.el.components.vrm;
        console.log(vrmComponent);
    },
    update: function () {},
    tick: function () {},
    remove: function () {},
    pause: function () {},
    play: function () {},
})