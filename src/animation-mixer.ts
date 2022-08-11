//original code : https://github.com/n5ro/aframe-extras/blob/master/src/loaders/animation-mixer.js
import {Object3D, Quaternion, Vector3} from "three";
import {Component, THREE} from "aframe";
import {VRM} from "@pixiv/three-vrm";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

const LoopMode = {
    once: THREE.LoopOnce,
    repeat: THREE.LoopRepeat,
    pingpong: THREE.LoopPingPong
};

export interface animationMixerComponent extends Component {
    model: Object3D|undefined,
    mixer:THREE.AnimationMixer|undefined,
    activeActions: Array<THREE.AnimationAction>,
}
/**
 * animation-mixer
 *
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations through THREE.AnimationMixer.
 * See: https://threejs.org/docs/?q=animation#Reference/Animation/AnimationMixer
 */
AFRAME.registerComponent('animation-mixer', {
    schema: {
        clip: { default: '*' },
        duration: { default: 0 },
        clampWhenFinished: { default: false, type: 'boolean' },
        crossFadeDuration: { default: 0 },
        loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
        repetitions: { default: Infinity, min: 0 },
        timeScale: { default: 1 },
        startFrame: { default: 0 },
    },

    init: function () {
        this.model = undefined as THREE.Mesh|undefined;
        this.mixer = undefined as THREE.AnimationMixer|undefined;
        this.activeActions = [] as Array<THREE.AnimationAction>;

        const model = this.el.getObject3D('mesh');

        if (model) {
            this.load(model);
        } else {
            this.el.addEventListener('model-loaded', (e) => {
                // @ts-ignore
                this.load(e.detail.model);
            });
        }
    },

    load: function (model:Object3D) {
        const el = this.el;
        this.model = model;
        this.mixer = new THREE.AnimationMixer(model);
        this.mixer.addEventListener('loop', (e) => {
            el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });
        });
        this.mixer.addEventListener('finished', (e) => {
            el.emit('animation-finished', { action: e.action, direction: e.direction });
        });
        if (this.data.clip) this.update({});
    },

    remove: function () {
        if (this.mixer) this.mixer.stopAllAction();
    },

    update: function (prevData) {
        if (!prevData) return;

        const data = this.data;
        const changes = AFRAME.utils.diff(data, prevData);

        // If selected clips have changed, restart animation.
        if ('clip' in changes) {
            this.stopAction();
            if (data.clip) this.playAction();
            return;
        }

        // Otherwise, modify running actions.
        this.activeActions.forEach((action) => {
            if ('duration' in changes && data.duration) {
                action.setDuration(data.duration);
            }
            if ('clampWhenFinished' in changes) {
                action.clampWhenFinished = data.clampWhenFinished;
            }
            if ('loop' in changes || 'repetitions' in changes) {
                // @ts-ignore
                action.setLoop(LoopMode[data.loop], data.repetitions);
            }
            if ('timeScale' in changes) {
                action.setEffectiveTimeScale(data.timeScale);
            }
        });
    },

    stopAction: function () {
        const data = this.data;
        for (let i = 0; i < this.activeActions.length; i++) {
            data.crossFadeDuration
                ? this.activeActions[i].fadeOut(data.crossFadeDuration)
                : this.activeActions[i].stop();
        }
        this.activeActions.length = 0;
    },

    playAction: function () {
        if (!this.mixer) return;

        const model = this.model,
            data = this.data,
            clips = model?.animations || [];

        if (!clips.length) return;

        const re = wildcardToRegExp(data.clip);

        for (let clip, i = 0; (clip = clips[i]); i++) {
            if (clip.name.match(re)) {
                const action = this.mixer.clipAction(clip, model);

                action.enabled = true;
                action.clampWhenFinished = data.clampWhenFinished;
                if (data.duration) action.setDuration(data.duration);
                if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
                this.mixer.setTime(data.startFrame / 1000);
                // @ts-ignore
                action.setLoop(LoopMode[data.loop], data.repetitions)
                    .fadeIn(data.crossFadeDuration)
                    .play();
                this.activeActions.push(action);
                console.log("fin setup animation")
            }
        }
    },

    tick: function (t, dt) {
        if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
    },

    model:undefined as Object3D|undefined,
    mixer:undefined as THREE.AnimationMixer|undefined,
    activeActions: [] as Array<THREE.AnimationAction>,
});

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp(s: string) {
    return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(s: string) {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}