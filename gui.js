const gui = new dat.GUI();
const options = {
    numUsers: 10,
    friendsPerUser: 4,
    diffuseRate: 5
};
gui.width *= 2;
gui.add(options, 'numUsers', 2, 25).name('Number of Users');
gui.add(options, 'friendsPerUser', 2, 8).name('Friends per User');
gui.add(options, 'diffuseRate' , 1, 50).name('Rate of Information Spreading');
gui.add({restart}, 'restart').name('Restart');
gui.add({help}, 'help').name('Help');

let endingButton;
let groupButton;
function addEndingButton(){
    endingButton = gui.add({endingButtonPressed}, 'endingButtonPressed').name('Show Propagation Summary')

}
function addGroupButton(){
    groupButton = gui.add({groupButtonPressed}, 'groupButtonPressed').name('Show Similar Groups of Users')

}
function removeEndingButton(){
    if(endingButton){
        endingButton.remove();
        endingButton = null;
    }
}
function removeGroupButton(){
    if(groupButton){
        groupButton.remove();
        groupButton = null;
    }
}
restart();
help();