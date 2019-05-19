const sphereStartingDiameter = 1;
const cubeSize = 1000;

var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(1, 1, 1);

// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, cubeSize / 2, cubeSize), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

let spheres = [];

for (let i = 0; i < 30; i++) {
    let diameter = i === 0 ? sphereStartingDiameter : 0;
    let mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: mapDiameter(diameter)}, scene);
    while(true) {
        mesh.position.x = Math.random() * cubeSize - cubeSize / 2;
        mesh.position.y = Math.random() * cubeSize;
        mesh.position.z = Math.random() * cubeSize - cubeSize / 2;

        let tooClose = false;
        /*for (let otherSphere of spheres) {
            if (BABYLON.Vector3.Distance(otherSphere.mesh.position, mesh.position) < maxSize * 2.5) {
                tooClose = true;
                break;
            }
        }*/
        if (!tooClose) break;
    }
    spheres.push({mesh, diameter});
}

for (let sphere of spheres) {
    sphere.friends = [];
    let friendCount = numFriends();
    while (sphere.friends.length < friendCount) {
        let random = spheres[Math.floor(Math.random() * spheres.length)];
        if (!sphere.friends.includes(random)) {
            sphere.friends.push(random);
        }
    }
}

// Our built-in 'ground' shape.
var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: cubeSize, height: cubeSize}, scene);

engine.runRenderLoop(function () {
    update(spheres);
    for (let sphere of spheres) {
        let pos = sphere.mesh.position;
        sphere.mesh.dispose();
        sphere.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: mapDiameter(sphere.diameter)}, scene);
        sphere.mesh.position = pos;
    }
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});