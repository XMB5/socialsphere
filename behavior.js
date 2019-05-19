const maxSize = 1000;
const numSpheres = 30;
const numConnections = numSpheres * 3;
function update(spheres){
    //stores previous diameter values of each sphere
    for(let sphere of spheres){
        sphere.prevDiameter = sphere.diameter
    }
    for(let sphere of spheres){
        let percent = (sphere.prevDiameter * .007) / sphere.friends.length;
        //add a portion of the sphere's diameter to each of its friends
        for(let friend of sphere.friends){
            friend.diameter += percent;
            sphere.diameter -= percent;
        }
    }
}
function mapDiameter(diameter){
    return diameter * 990 + 10;
}
function numFriends(){
    return Math.random() * 8 + 2;
}
function colorMap(diameter) {
    return new BABYLON.Color3(1 - diameter * numSpheres / 2, diameter * numSpheres / 2, 0);
}