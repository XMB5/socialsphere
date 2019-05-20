const sphereStartingDiameter = 1;
const cubeSize = 1000;
let run;
let hasAlreadyAddedButton;
let hasAlreadyAddedGroup;
let colorMode;
function help() {
    run = false;
    Swal.fire({
        title: 'Social Network Information Visualization ',
        html: 'When you press OK, the simulation will begin. <br/>' +
        'Part 1 of the simulation:<br/>' +
        'The purple sphere represents a user injecting some information to a network.' +
        'Over time, this information spreads through friend connections(lines connecting spheres).<br/><br/>' +
        'Part 2 of the simulation: <br/>' +
        'Once all the spheres(users) are purple, press \'Show Propagation Summary\'. <br/>' +
        'Users are colored based on how quickly they received the information(green = fast, red = slow). ' +
        'This shows how related the spheres(users) are to the original sphere(user).<br/><br/>' +
            'You can also press \'Show Related Groups of Users\' to more see distinct groups of like minded users.<br/>' +
            'Like-Minded users are groups of users who exchanged the most mass(information) throughout the duration of the simulation.' +
            '(Most useful with a higher number of users. Colors have no significance.) <br/><br/>' +
            'This simulation demonstrates several aspects of social media which I address in other parts of my project' +
            ', including group theory, networked group dynamics, and how information spreads. ' +
            'It also proves the lack of anonymity, since any friends you have help contribute to your identity. <br/><br/>' +
        'Note: Adjust parameters and restart the simulation with the buttons on the dashboard.<br/>' +
        'Press help to display this text and pause the simulation.<br/><br/>',
        footer: 'Full Code is available at https://github.com/XMB5/socialsphere'}).then(() => run = true);
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
    removeGroupButton();
    hasAlreadyAddedButton = false;
    hasAlreadyAddedGroup = false;
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
            else if(colorMode === 1){
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
                    material.diffuseColor = colorMap(1 - sphere.lifespan /max);
                    sphere.mesh.material = material;
                }
            }
            //Group theory - break nodes down into groups
            else if(colorMode === 2){
                if(i === 0){
                    sphere.mesh.material = purple;
                }
                else {
                    let max = 0;
                    let min = 999999;
                    for (let sphere of spheres) {
                        if (sphere.lifespan > max) {
                            max = sphere.lifespan
                        }
                        if (sphere.lifespan < min) {
                            min = sphere.lifespan
                        }
                    }
                    max -= min;
                    let material = new BABYLON.StandardMaterial();
                    if (sphere.lifespan > max * .9) {
                        material.diffuseColor = new BABYLON.Color3(0, 1, 1);
                        sphere.mesh.material = material;
                    }
                    else if(sphere.lifespan > max * .8){
                        material.diffuseColor = new BABYLON.Color3(.5 , 1, 1);
                        sphere.mesh.material = material;
                    }
                    else if(sphere.lifespan > max * .7){
                        material.diffuseColor = new BABYLON.Color3(1, 1, .5);
                        sphere.mesh.material = material;
                    }
                    else if(sphere.lifespan > max * .6){
                        material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                        sphere.mesh.material = material;
                    }
                    else if(sphere.lifespan > max * .5){
                        material.diffuseColor = new BABYLON.Color3(1, 0 , 0);
                        sphere.mesh.material = material;
                    }
                    else{
                        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                        sphere.mesh.material = material;
                    }
                }
            }
            sphere.mesh.position = pos;
        }
        if(counter === spheres.length && !hasAlreadyAddedButton){
            hasAlreadyAddedButton = true;
            addEndingButton()
        }
        if(counter === spheres.length && !hasAlreadyAddedGroup){
            hasAlreadyAddedGroup = true;
            addGroupButton()
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