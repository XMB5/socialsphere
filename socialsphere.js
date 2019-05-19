const sphereStartingDiameter = 1;
const cubeSize = 1000;
let run = false;
Swal.fire(`This is Ben's aweesome 21st project`).then(() => run = true);

var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(1, 1, 1);

// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, 0, cubeSize * 2, new BABYLON.Vector3(0, cubeSize / 2, cubeSize), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

let spheres = [];

for (let i = 0; i < numSpheres; i++) {
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
    spheres.push({mesh, diameter, friends: []});
}

const black = new BABYLON.Color4(0, 0, 0, 1);

const lines = [];

for (let i = 0; i < numConnections; i++) {
    let sphere1 = spheres[Math.floor(Math.random() * spheres.length)];
    let sphere2 = spheres[Math.floor(Math.random() * spheres.length)];
    if (sphere1 !== sphere2 && !sphere1.friends.includes(sphere2)) {
        sphere1.friends.push(sphere2);
        sphere2.friends.push(sphere1);
        lines.push([
                sphere1.mesh.position,
                sphere2.mesh.position
        ]);
    }
}

BABYLON.MeshBuilder.CreateLineSystem('lines', {
    lines,
    colors: new Array(lines.length).fill([black, black])
}, scene);

// Our built-in 'ground' shape.
var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: cubeSize, height: cubeSize}, scene);

const purple = new BABYLON.StandardMaterial();
purple.diffuseColor = new BABYLON.Color3(1,0,1);

engine.runRenderLoop(function () {
    if(run) {
        update(spheres);
        for (let i = 0; i < spheres.length; i++) {
            let sphere = spheres[i];
            let pos = sphere.mesh.position;
            sphere.mesh.dispose();
            sphere.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: mapDiameter(sphere.diameter)}, scene);
            if (i === 0 || sphere.diameter === 1) {
                sphere.mesh.material = purple;
            } else {
                let material = new BABYLON.StandardMaterial();
                material.diffuseColor = colorMap(sphere.diameter);
                sphere.mesh.material = material;
            }
            sphere.mesh.position = pos;
        }
    }
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});