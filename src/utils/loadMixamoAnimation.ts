/* global THREE, THREE_VRM, mixamoVRMRigMap
src: https://github.com/V-Sekai/three-vrm-1-sandbox-mixamo/blob/master/loadMixamoAnimation.js
deepl.com pour la traduction
    */
import {VRM, VRMHumanBoneName} from "@pixiv/three-vrm";

import * as THREE from 'three';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import { mixamoVRMRigMap } from "./mixamo-VRM-rigmap"
import {Quaternion} from "three";

/**
 * Charger les animations Mixamo, les ajuster et les renvoyer pour le VRM.
 * @param {string} url URL avec mouvement Mixamo.
 * @param {VRM} vrm Modèle VRM
 * @returns {Promise<THREE.AnimationClip>} AnimationClip
 */
export function loadMixamoAnimation( url:string, vrm:VRM ) {
    const loader = new FBXLoader(); // Chargeur pour charger FBX
    return loader.loadAsync( url ).then( ( asset ) => {

        const clip = THREE.AnimationClip.findByName( asset.animations, 'mixamo.com' ); // Extraction de l'AnimationClip.

        //console.log("asset : ",asset);
        /*
        const rootAssetBone:THREE.Bone = asset.children[0] as THREE.Bone;
        let BonelistToParse:THREE.Bone[] = [rootAssetBone];
        let BoneMap:Map<string,THREE.Bone> = new Map<string, THREE.Bone>();

        while(BonelistToParse.length != 0){
            BonelistToParse[0].children.forEach(child => {
                BonelistToParse.push(child as THREE.Bone)
            })
            BoneMap.set(mixamoVRMRigMap[ BonelistToParse[0].name ],BonelistToParse[0] )
            BonelistToParse.shift();
        }*/

        //console.log(BoneMap)

        const tracks:THREE.KeyframeTrack[] = []; // Le KeyframeTrack pour VRM est stocké dans ce tableau.

        clip.tracks.forEach( ( track ) => {
            // Convertissez chaque piste pour VRM et stockez-les dans `tracks`.
            const trackSplitted = track.name.split( '.' );
            const mixamoRigName = trackSplitted[ 0 ];
            const vrmBoneName:VRMHumanBoneName =<VRMHumanBoneName> mixamoVRMRigMap[ mixamoRigName ];

            // console.log(mixamoRigName,vrmBoneName)
            const vrmNodeName = vrm.humanoid?.getBoneNode( vrmBoneName )?.name;

            if ( vrmNodeName != null ) {
                const propertyName = trackSplitted[ 1 ];

                if ( track instanceof THREE.QuaternionKeyframeTrack ) {

                    const threetrack = new THREE.QuaternionKeyframeTrack(
                        `${ vrmNodeName }.${ propertyName }`,
                        Array.from(track.times),
                        Array.from(track.values.map( ( v, i ) => (
                             (vrm.meta?.version === '0' && (i % 2) === 0) ? -v : v
                        ))),
                    )
                    /*
                    const initialBone:THREE.Bone = BoneMap.get(vrmBoneName) as THREE.Bone

                    //console.log("initial",initialQuaternion);

                    const t = threetrack.values;

                    //si t = 4, alors t is scale
                    if(t.length != 4) {
                        for (let i = 0; i <t.length; i+=4) {
                            const q = new Quaternion(t[i],t[i+1],t[i+2],t[i+3])

                            //console.log(q,initialQuaternion);

                            //q.invert();

                            //.multiply(initialQuaternion)

                           // console.log(q);
                          //  console.log(" ")
                            t[i] = q.x;
                            t[i+1] = q.y;
                            t[i+2] = q.z;
                            t[i+3] = q.w;

                        }
                    }
                    */
                    //console.log(t)
                    tracks.push( threetrack );
                }
                else if ( track instanceof THREE.VectorKeyframeTrack ) {
                    //console.log("vector ",vrmNodeName)
                    const threetrack = new THREE.VectorKeyframeTrack(
                        `${ vrmNodeName }.${ propertyName }`,
                        Array.from(track.times),
                        Array.from(track.values.map( ( v, i ) => (
                            ( ( vrm.meta?.version === '0' && ( i % 3 ) !== 1 ) ? -v : v ) * 0.01
                        ))),
                    )
                    //const initialBone:THREE.Bone = BoneMap.get(vrmBoneName) as THREE.Bone
                    //console.log(threetrack,initialBone)
                    tracks.push( threetrack );
                }
            }
        } );
        //console.log(tracks[1])
        return new THREE.AnimationClip( 'vrmAnimation', clip.duration, tracks );
    } );
}