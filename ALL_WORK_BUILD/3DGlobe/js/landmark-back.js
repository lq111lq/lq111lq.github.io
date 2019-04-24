function Landmark(name, colorStr) {
    var canvas = document.createElement('canvas');
    var size = 512;
    var r = size / 2;
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext('2d');
    context.beginPath();
    // context.arc(r, r, r, 0, 2 * Math.PI);;
    // context.arc(r, r, r * 0.9, 2 * Math.PI, 0, true);
    // context.closePath();
    // context.fillStyle = colorStr || "#FFFF00";
    // context.fill();

    context.font = "900 " + r * 0.3 + "px SimHei";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = colorStr || "#FFFF00";
    context.fillText(name, r, r);
    // context.strokeStyle = colorStr || "#FFFF00";
    // context.lineWidth = 10;
    context.strokeText(name, r, r);

    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        fog: true
    });

    THREE.Sprite.call(this, material);
}

Landmark.prototype = Object.create(THREE.Sprite.prototype);
Landmark.prototype.constructor = Landmark;
