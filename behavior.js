function update(spheres){
    //stores previous diameter values of each sphere
    for(let sphere of spheres){
        sphere.prevDiameter = sphere.diameter
    }
    for(let sphere of spheres){
        let percent = (sphere.prevDiameter * .2) / sphere.friends.length();
        //add a portion of the sphere's diameter to each of its friends
        for(let friend of sphere.friends){
            friend.diameter += percent
        }
    }
}
