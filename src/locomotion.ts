/*
Toogle animations based on input

Animations use mixamo default asset pack naming convention
 */
import {VRMComponent} from "./vrm";
import {AnimationClip, Vector3, XRSession, MathUtils} from "three";
import {animationMixerComponent} from "./animation-mixer";

AFRAME.registerComponent("locomotion",{
    events:{
        'model-loaded': (e: any) => {
            console.log(e)
            const vrmComponent: VRMComponent = <VRMComponent> e.target.components.vrm;
            console.log(vrmComponent.avatar)
            console.log(vrmComponent?.avatar?.humanoid?.restPose?.hips?.position)
            e.target.components.locomotion.originalPosition = new Vector3(...(vrmComponent?.avatar?.humanoid?.restPose?.hips?.position as Array<number>));
        }
    },
    schema: {
        speed: {type: 'number', default: 0.0015},// base movement speed
        camera: {type:'selector'},
        // handle movement if camera attached to model or distant
        cameraMode:{ default: 'distant', oneOf: ['attached','distant'] },
        //Duration in seconds of transition between animations
        crossFadeDuration :{default: 0.4}
    },
    init() {

        /// ////////////////////////////// CONTROLLER SETUP //////////////////////////////////////////
        this.hasGamepad = false
        // traditional gamepad setup
        window.addEventListener('gamepadconnected', (e) => {
            const gp = navigator.getGamepads()[e.gamepad.index]
            this.hasGamepad = true
        })
        // xr controller setup
        this.el.sceneEl?.addEventListener('enter-vr', () => {
            // @ts-ignore
            this.el.sceneEl?.xrSession.addEventListener('inputsourceschange', (e) => {
                if (e.added.length !== 0) {
                    if (e.added[0].gamepad.axes.length === 0) {
                        this.vrType = 'hands'
                    } else if (e.added[0].gamepad.axes.length === 4) {
                        this.vrType = 'controllers'
                    }
                }
                this.hasGamepad = true
                this.isInHeadset = true
            })
        })
        /// ////////////////////////////// KEYBOARD SETUP //////////////////////////////////////////
        this.usingKeyboard = false

        // @ts-ignore
        this.handleKeyDown = AFRAME.utils.bind(this.handleKeyDown, this);
        // @ts-ignore
        this.handleKeyUp = AFRAME.utils.bind(this.handleKeyUp, this);

        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup',this.handleKeyUp)

    },
    update() {
        this.speed = this.data.speed
        if(!this.data.camera) {
            // @ts-ignore
            this.data.camera = this.el.sceneEl?.camera?.el
        }
    },
    tick(time, timeDelta) {
        if(this.el.components["animation-mixer"] == undefined)return;

        const sensitivity = 0.3
        /// ////////////////////////////// INPUT SELECTION //////////////////////////////////
        const inputCheck = (input:string|null) => {
            switch (input) {
                case 'xrGamepad':
                    // VR controller (i.e. Oculus Quest)
                    // @ts-ignore
                    if (this.vrType === 'controllers' && this.el.sceneEl?.xrSession.inputSources.length > 0) {
                        // @ts-ignore
                        const controllers:XRSession.inputSources = Array.from(this.el.sceneEl?.xrSession.inputSources)
                        let vrLeftVert; let
                            vrLeftHoriz
                        // left thumbstick controls character
                        for (let i = 0; i < controllers.length; i++) {
                            if (controllers[i].handedness === 'left') {
                                // @ts-ignore
                                vrLeftVert = this.el.sceneEl?.xrSession.inputSources[i].gamepad.axes[3]
                                // @ts-ignore
                                vrLeftHoriz = this.el.sceneEl?.xrSession.inputSources[i].gamepad.axes[2]
                            }
                        }
                        if (vrLeftVert > sensitivity || vrLeftVert < -sensitivity || vrLeftHoriz < -sensitivity || vrLeftHoriz > sensitivity) {
                            this.forward = -Math.min(Math.max(-1, vrLeftVert), 1)
                            this.side = -Math.min(Math.max(-1, vrLeftHoriz), 1)
                            this.isMoving = true
                        } else {
                            this.isMoving = false
                        }
                    }
                    break
                case 'gamepad':
                    // traditional gamepad (i.e. Xbox, Playstation, etc)
                    if (this.gamepads[0]) {
                        const gamepadLeftVert = this.gamepads[0].axes[1]
                        const gamepadLeftHoriz = this.gamepads[0].axes[0]
                        if (gamepadLeftVert > sensitivity || gamepadLeftVert < -sensitivity || gamepadLeftHoriz < -sensitivity || gamepadLeftHoriz > sensitivity) {
                            this.forward = -Math.min(Math.max(-1, gamepadLeftVert), 1)
                            this.side = -Math.min(Math.max(-1, gamepadLeftHoriz), 1)
                            this.isMoving = true
                        } else {
                            this.isMoving = false
                        }
                    }
                    break
                case 'keyboard':
                    if (!this.fwd && !this.back && !this.left && !this.right) {
                        this.usingKeyboard = false
                        this.isMoving = false
                        return
                    }
                    // diagonal controls
                    if (this.fwd && this.left) {
                        this.forward = -Math.min(Math.max(-1, -1), 1)
                        this.side = -Math.min(Math.max(-1, -1), 1)
                    }
                    if (this.fwd && this.right) {
                        this.forward = -Math.min(Math.max(-1, -1), 1)
                        this.side = -Math.min(Math.max(-1, 1), 1)
                    }
                    if (this.back && this.left) {
                        this.forward = -Math.min(Math.max(-1, 1), 1)
                        this.side = -Math.min(Math.max(-1, -1), 1)
                    }
                    if (this.back && this.right) {
                        this.forward = -Math.min(Math.max(-1, 1), 1)
                        this.side = -Math.min(Math.max(-1, 1), 1)
                    }
                    // cardinal controls
                    if (this.fwd && !this.left && !this.right) {
                        this.forward = -Math.min(Math.max(-1, -1), 1)
                        this.side = 0
                    }
                    if (this.back && !this.left && !this.right) {
                        this.forward = -Math.min(Math.max(-1, 1), 1)
                        this.side = 0
                    }
                    if (this.left && !this.fwd && !this.back) {
                        this.forward = 0
                        this.side = -Math.min(Math.max(-1, -1), 1)
                    }
                    if (this.right && !this.fwd && !this.back) {
                        this.forward = 0
                        this.side = -Math.min(Math.max(-1, 1), 1)
                    }
                    this.isMoving = true
                    break
                default:
                    // touch input
                    if (this.offsetY > sensitivity || this.offsetY < -sensitivity || this.offsetX < -sensitivity || this.offsetX > sensitivity) {
                        this.forward = -Math.min(Math.max(-1, this.offsetY), 1)
                        this.side = -Math.min(Math.max(-1, this.offsetX), 1)
                        this.isMoving = true
                    }
                    else {
                        this.isMoving = false
                    }
            }
        }

        if (this.hasGamepad === true) {
            /// ////////////////////////////// CONTROLLER MANAGEMENT //////////////////////////////////////////
            // @ts-ignore
            this.gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [])
            if (!this.gamepads) {
                return
            }
            if (this.isInHeadset) {
                inputCheck('xrGamepad')
            } else {
                inputCheck('gamepad')
            }
        }
        if (this.usingKeyboard === true) {
            inputCheck('keyboard')
        }
        /// ////////////////////////////// CHARACTER MOVEMENT //////////////////////////////////

        if(!this.data.camera) {
            // @ts-ignore
            this.data.camera = this.el.sceneEl?.camera.el
        }

        if (this.isMoving) {
            if(this.startTimer == -1){
                this.startTimer = this.currentSpeed/this.speed;
                console.log("go")

                this.el.setAttribute('animation-mixer', {
                    clip: 'Walking',
                    //loop: 'repeat',
                    crossFadeDuration: this.data.crossFadeDuration,
                })
            }
            if(this.startTimer <= (this.data.crossFadeDuration*1000)){
                this.startTimer+=(timeDelta/1000)
                this.currentSpeed = MathUtils.lerp(this.currentSpeed,this.speed, this.startTimer * (1/(this.data.crossFadeDuration*1000)))
            }
            else {
                this.currentSpeed = this.speed;
            }
            this.stopTimer = -1;


        }
        else {
            if(this.stopTimer === -1){
                this.stopTimer = this.currentSpeed-this.speed/-this.speed;
                this.el.setAttribute('animation-mixer', {
                    clip: 'idle',
                    //loop: 'repeat',
                    crossFadeDuration: this.data.crossFadeDuration,
                })
            }
            if(this.stopTimer <= (this.data.crossFadeDuration*1000)){
                this.stopTimer+=(timeDelta/1000)
                this.currentSpeed = MathUtils.lerp(this.currentSpeed,0, this.stopTimer * (1/(this.data.crossFadeDuration*1000)))
            }
            else {
                this.currentSpeed = 0;
            }
            this.startTimer = -1



        }


        const camY = this.data.camera.object3D.rotation.y  // get y rot of camera
        this.joystickRot = Math.atan2(this.forward, this.side)
        this.joystickRot -= camY
        this.el.object3D.position.z -= this.currentSpeed * Math.sin(this.joystickRot) * timeDelta
        this.el.object3D.position.x -= this.currentSpeed * Math.cos(this.joystickRot) * timeDelta
        this.el.object3D.rotation.y = -this.joystickRot - Math.PI / 2

    },
    remove() {
        window.removeEventListener('keydown', this.handleKeyDown)
        window.removeEventListener('keyup',this.handleKeyUp)
    },
    handleKeyDown(e:any){
        if (e.key === 'ArrowUp' || e.code === 'KeyW') {
            this.fwd = true
        }
        if (e.key === 'ArrowDown' || e.code === 'KeyS') {
            this.back = true
        }
        if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
            this.left = true
        }
        if (e.key === 'ArrowRight' || e.code === 'KeyD') {
            this.right = true
        }
        if (!this.usingKeyboard) {
            this.usingKeyboard = true
        }
    },
    handleKeyUp(e:any){
        if (e.key === 'ArrowUp' || e.code === 'KeyW') {
            this.fwd = false
        }
        if (e.key === 'ArrowDown' || e.code === 'KeyS') {
            this.back = false
        }
        if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
            this.left = false
        }
        if (e.key === 'ArrowRight' || e.code === 'KeyD') {
            this.right = false
        }
    },
    usingKeyboard:false as boolean,
    originalPosition:new Vector3(0,0,0),
    currentPosition:new Vector3(0,0,0),
    hasGamepad: false,
    isInHeadset:false,
    isMoving:false,
    fwd:false,
    back:false,
    left:false,
    right:false,
    forward:0,
    side:0,
    speed:0,
    startTimer:0,
    stopTimer:0,
    currentSpeed:0,
    offsetX:0,
    offsetY:0,
    offsetZ:0,
    joystickRot:0,
    vrType:"",
    gamepads:undefined as unknown as (Gamepad | null)[],
})