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
    <a-entity vrm="src:./assets/avatar_VRM10.vrm;debug:true" vrm-animation="defaultAnimation:./assets/mixamo-animations/Male Locomotion Pack/idle.fbx"></a-entity>
</a-scene>
</body>
````

##features
(Alphabetical order)
- [x] Animation
    - [x] Mixamo Import
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