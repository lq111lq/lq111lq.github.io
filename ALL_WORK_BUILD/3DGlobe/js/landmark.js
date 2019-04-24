function Landmark(name, colorStr) {
    THREE.Group.call(this);
    var canvas = document.createElement('canvas');
    var size = 512;
    var r = size / 2;
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext('2d');
    context.beginPath();

    context.font = "900 " + r * 0.3 + "px SimHei";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = colorStr || "#FFFF00";
    context.fillText(name, r, r);
    context.strokeText(name, r, r);

    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        fog: true
    });

    var sprite = new THREE.Sprite(material);
    sprite.scale.set(8, 8, 8)
    sprite.position.set(-3, 0, -10)
    this.add(sprite);

    var material = new THREE.LineBasicMaterial({
        color: colorStr || 0xffff00
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -10),
        new THREE.Vector3(-1, 0, -10)
    );
    var subline = new THREE.Line(geometry, material);
    this.add(subline);

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0.5, 0),
        new THREE.Vector3(1, -0.5, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(-1, -0.5, 0),
        new THREE.Vector3(-1, 0.5, 0),
        new THREE.Vector3(0, 1, 0)
    );

    var lineInner = new THREE.Line(geometry, material);
    var lineOuter = new THREE.Line(geometry, material);
    lineOuter.scale.set(1.5, 1.5, 0);

    this.add(lineInner);
    this.add(lineOuter);

    var t = { value: 1 };
    var tween = new TWEEN.Tween(t)
        .to({ value: 2 }, 1000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate(updateHandler);

    var tweenBack = new TWEEN.Tween(t)
        .to({ value: 1 }, 1000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate(updateHandler);

    function updateHandler() {
        var s = t.value;
        lineInner.scale.set(s, s, s);
        //lineOuter.scale.set(s,s,s);
    }



    tween.chain(tweenBack);
    tweenBack.chain(tween);

    tween.start();
}

Landmark.prototype = Object.create(THREE.Group.prototype);
Landmark.prototype.constructor = Landmark;
