function update(spheres){
    //stores previous diameter values of each sphere
    for(let sphere of spheres){
        sphere.prevDiameter = sphere.diameter;
        if(sphere.diameter !== 1)
            sphere.lifespan += 1
    }
    for(let sphere of spheres){
        let percent = (sphere.prevDiameter * options.diffuseRate / 1000) / sphere.friends.length;
        //add a portion of the sphere's diameter to each of its friends
        for(let friend of sphere.friends){
            friend.diameter += percent;
            if(friend.diameter > 1){
                friend.diameter = 1;
            }
        }
    }
}
function mapDiameter(diameter){
    return diameter * 90 + 10;
}
function numFriends(){
    return Math.random() * 8 + 2;
}
function colorMap(diameter) {
    return new BABYLON.Color3(1 - diameter * options.numUsers / 2, diameter * options.numUsers / 2, 0);
}
function endingButtonPressed(){
    colorMode = 1
}
function groupButtonPressed(){
    colorMode = 2
}