# avatar-vrm-xr
VRM avatar support for Aframe based on pixiv's threejs implementation.

## Usage
````html
<head>
    <title>My A-frame Scene</title>
    <meta charset="utf-8">
    <script src="a-avatar-vrm.js"></script>
</head>
<body>
<a-scene>
    <a-entity vrm="src:./assets/avatar_VRM10.vrm;debug:true"  mixamo-2-vrm="singleAnimation:./assets/mixamo-animations/Male Locomotion Pack/idle.fbx"></a-entity>
</a-scene>
</body>
````
##components

###vrm
Load a vrm similarly as the gltf-model component

####Properties
| Property | Type  | Default |
|----------|-------|---------|
| src      | asset | ""      |

####Events
| name           | Details              |
|----------------|----------------------|
| loaded         | vrm object           |
| loading        | progressEvent object |
| loading-error  | errorEvent object    |

####Accessing the VRM object through other components
``````js
AFRAME.registerComponent("vrm-logger",{
    init(){
        const vrmComponent =  this.el.components.vrm;
        console.log("vrm : ", vrmComponent.avatar)
    }
})
``````

###mixamo-2-vrm
Load mixamo animations as fbx, convert them to match the vrm skeleton and add them to the avatar's scene.

####Properties
| Property        | Type            | Default | required                             |
|-----------------|-----------------|---------|--------------------------------------|
| singleAnimation | asset           | ""        | false if **animations** is not []    |
| animations      | array of assets | []        | false if **singleAnimation** is not "" |

####Events

| name                    | details                           |
|-------------------------|-----------------------------------|
| mixamo-animation-loaded | animation list from the vrm scene |



##Roadmap
(Alphabetical order)
- [x] Animation
    - [x] Mixamo Import
    - [ ] Animation mixer
- [ ] Blendshape
    - [ ] facial expression
    - [ ] realistic mouth distortion based on voice
- [ ] Controls
    - [ ] desktop style locomotion
    - [ ] XR tracking
        - [ ] head & hand + locomotion (for legs)
        - [ ] full body tracking
- [ ] Eye
    - [ ] blinking
    - [ ] look-at
- [x] Loading avatar
- [ ] Physics for dress and hair
- [ ] Avatar LOD

## Building and running on localhost

First install dependencies:

```sh
npm install
```

To start development:

```sh
npm run start
```

To create a production build:

```sh
npm run build-prod
```

To create a development build:

```sh
npm run build-dev
```

## Running

```sh
node dist/bundle.js
```