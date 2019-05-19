const sphereStartingDiameter = 1;
const cubeSize = 1000;
let run;
let hasAlreadyAddedButton;
let colorMode;
function help() {
    run = false;
    Swal.fire('Explanation', 'You have stumbled upon my almost done 21st project. Nice Job!').then(() => run = true);
}

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
let linesMesh;

const black = new BABYLON.Color4(0, 0, 0, 1);

function restart() {
    colorMode = 0;
    removeEndingButton();
    hasAlreadyAddedButton = false;
    for (let sphere of spheres) {
        sphere.mesh.dispose();
    }
    spheres.length = 0;
    for (let i = 0; i < options.numUsers; i++) {
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
        spheres.push({mesh, diameter, lifespan: 0, friends: []});
    }

    const lines = [];

    for (let i = 0; i < options.numUsers * options.friendsPerUser; i++) {
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

    if (linesMesh) {
        linesMesh.dispose();
    }

    linesMesh = BABYLON.MeshBuilder.CreateLineSystem('lines', {
        lines,
        colors: new Array(lines.length).fill([black, black])
    }, scene);
}

// Our built-in 'ground' shape.
var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: cubeSize, height: cubeSize}, scene);

const purple = new BABYLON.StandardMaterial();
purple.diffuseColor = new BABYLON.Color3(1,0,1);

engine.runRenderLoop(function () {
    if(run) {
        update(spheres);
        let counter = 0;
        for (let i = 0; i < spheres.length; i++) {
            let sphere = spheres[i];
            if(sphere.diameter === 1){
                counter++
            }
            let pos = sphere.mesh.position;
            sphere.mesh.dispose();
            sphere.mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: mapDiameter(sphere.diameter)}, scene);
            if(colorMode === 0) {
                if (i === 0 || sphere.diameter === 1) {
                    sphere.mesh.material = purple;
                } else {
                    let material = new BABYLON.StandardMaterial();
                    material.diffuseColor = colorMap(sphere.diameter);
                    sphere.mesh.material = material;
                }
            }
            else{
                if(i === 0){
                    sphere.mesh.material = purple;
                }
                else {
                    let max = 0;
                    for (let sphere of spheres) {
                        if (sphere.lifespan > max) {
                            max = sphere.lifespan
                        }
                    }
                    let material = new BABYLON.StandardMaterial();
                    material.diffuseColor = colorMap(1 - sphere.lifespan / max);
                    sphere.mesh.material = material;
                }
            }
            sphere.mesh.position = pos;
        }
        if(counter === spheres.length && !hasAlreadyAddedButton){
            hasAlreadyAddedButton = true;
            addEndingButton()
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