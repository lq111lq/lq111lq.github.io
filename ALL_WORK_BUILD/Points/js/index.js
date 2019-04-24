/*STATS 帧数插件*/
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.getElementById("Stats-output").appendChild(stats.domElement);


/*THREE.JS*/
var container = document.getElementById('container');

var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFFFFF, 0);
container.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 20000);

var dataArr = [];
for (n in data) {
    data[n].forEach(function(d, i) {
        d.crowd = i % 3;
        dataArr.push(d);
    });
}

function getPostion(lon, lat, r) {
    var position = new THREE.Vector3(0, 0, 0);
    var x = 0;
    var y = 0;
    var z = 0;

    var y = Math.sin(lat / 180 * Math.PI) * r;
    var r0 = Math.cos(lat / 180 * Math.PI) * r;

    var x = Math.sin(lon / 180 * Math.PI) * r0;
    var z = Math.cos(lon / 180 * Math.PI) * r0;
    position.set(x, y, z);
    return position;
};

function initFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    result.size = 2;
    result.position[0] = 0;
    result.position[1] = 0;
    result.position[2] = 0;
    if (d.crowd == 0) {
        result.color[0] = 1;
        result.color[1] = 0;
        result.color[2] = 0;
    }
    if (d.crowd == 1) {
        result.color[0] = 0;
        result.color[1] = 1;
        result.color[2] = 0;
    }
    if (d.crowd == 2) {
        result.color[0] = 0;
        result.color[1] = 0;
        result.color[2] = 1;
    }
    return result;
}

function crowdFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    if (d.crowd == 0) {
        result.position[0] = Math.random() * 100 + 50;
        result.position[1] = Math.random() * 100 - 50;
        result.position[2] = Math.random() * 100;
    }
    if (d.crowd == 1) {
        result.position[0] = Math.random() * 100 - 50;
        result.position[1] = Math.random() * 100 - 50;
        result.position[2] = Math.random() * 100;
    }
    if (d.crowd == 2) {
        result.position[0] = Math.random() * 100;
        result.position[1] = Math.random() * 100 + 50;
        result.position[2] = Math.random() * 100;
    }
    return result;
}

function crowdCircleFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    var position1 = getPostion(d.lon, d.lat, 130);
    var position2 = getPostion(d.lon, d.lat, 160);
    var position3 = getPostion(d.lon, d.lat, 190);
    result.size = 1;

    if (d.crowd == 0) {
        result.position[0] = position1.x;
        result.position[1] = position1.y;
        result.position[2] = position1.z;
    }
    if (d.crowd == 1) {
        result.position[0] = position2.x;
        result.position[1] = position2.y;
        result.position[2] = position2.z;
    }
    if (d.crowd == 2) {
        result.position[0] = position3.x;
        result.position[1] = position3.y;
        result.position[2] = position3.z;
    }
    return result;
}

function circleFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    var position = getPostion(d.lon, d.lat, 160);

    result.size = 1;
    result.position[0] = position.x;
    result.position[1] = position.y;
    result.position[2] = position.z;
    return result;
}

function planeFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    result.size = 1;
    result.position[0] = d.lon * 3;
    result.position[1] = d.lat * 3;
    result.position[2] = 0;
    return result;
}

function randomFrame(d) {
    var result = {
        size: 1,
        position: [0, 0, 0],
        color: [0, 0, 0]
    };

    result.size = 1;
    result.position[0] = Math.random() * 100;
    result.position[1] = Math.random() * 100 - 25;
    result.position[2] = Math.random() * 100;
    return result;
}

var points = new DataCloud(dataArr, [initFrame, circleFrame, planeFrame, randomFrame, crowdFrame, crowdCircleFrame]);
points.nextFramesNames.push('circleFrame', 'planeFrame', 'randomFrame', 'crowdFrame', 'crowdCircleFrame');

$('#b0').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('initFrame');
});

$('#b1').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('planeFrame');
});

$('#b2').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('circleFrame');
});

$('#b3').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('randomFrame');
});

$('#b4').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('crowdFrame');
});

$('#b5').click(function() {
    points.nextFramesNames.splice(0, points.nextFramesNames.length);
    points.nextFramesNames.push('crowdCircleFrame');
});

scene.add(points);
scene.add(camera);

camera.position.z = 1500;

function render() {
    stats.update();
    var distance = MouseControl.updateCamera(camera);
    //points.animate();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
