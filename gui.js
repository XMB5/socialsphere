const gui = new dat.GUI();
const options = {
    numUsers: 10,
    friendsPerUser: 4,
};
gui.width *= 1.5;
gui.add(options, 'numUsers', 2, 25).name('Number of Users');
gui.add(options, 'friendsPerUser', 2, 8).name('Friends per User');
gui.add({restart}, 'restart').name('Restart');
gui.add({help}, 'help').name('Help');

restart();
help();