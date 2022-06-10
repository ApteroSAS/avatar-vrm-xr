# avatar-vrm-xr
VRM avatar support for Aframe based on pixiv's threejs implementation.

##features
(Alphabetical order)
- [ ] Animation
    - [ ] Mixamo Import
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