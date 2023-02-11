/* global THREE, THREE_VRM, mixamoVRMRigMap
src: https://github.com/V-Sekai/three-vrm-1-sandbox-mixamo/blob/master/loadMixamoAnimation.js
deepl.com pour la traduction
    */
import {VRM, VRMHumanBoneName} from "@pixiv/three-vrm";

import * as THREE from 'three';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import { mixamoVRMRigMap } from "./mixamo-VRM-rigmap"
import {AnimationClip, Quaternion} from "three";

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
                        track.times,
                        track.values.map( ( v, i ) => (
                             (vrm.meta?.version === '0' && (i % 2) === 0) ? -v : v
                        )),
                    )

                    //console.log(t)
                    tracks.push( threetrack );
                }
                else if ( track instanceof THREE.VectorKeyframeTrack ) {
                    //console.log("vector ",vrmNodeName)
                    const threetrack = new THREE.VectorKeyframeTrack(
                        `${ vrmNodeName }.${ propertyName }`,
                        track.times,
                        track.values.map( ( v, i ) => (
                            ( ( vrm.meta?.version === '0' && ( i % 3 ) !== 1 ) ? -v : v ) * 0.01
                        )),
                    )
                    //const initialBone:THREE.Bone = BoneMap.get(vrmBoneName) as THREE.Bone
                    //console.log(threetrack,initialBone)
                    tracks.push( threetrack );
                }
            }
        } );

        const animationName = url.substring(url.lastIndexOf('/')+1).split('.')[0].split(" ").join("-");

        return new THREE.AnimationClip( animationName, clip.duration, tracks );
    } ).catch(
        reason =>  {
            //console.log(reason);
            return undefined as unknown as AnimationClip;
        }
    );
}
