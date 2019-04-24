define(function() {
    var landmark = new THREE.Group();

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        fog: true
    });

    var sprite = new THREE.Sprite(material);
    sprite.scale.set(16, 16, 16)
    sprite.position.set(0, 0, -20)
    landmark.add(sprite);

    var material = new THREE.LineBasicMaterial({
        linewidth: 10,
        color: 0x3DA0DD
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, -2),
        new THREE.Vector3(0, 0, -15)
    );
    var subline = new THREE.Line(geometry, material);
    landmark.add(subline);

    var shape = new THREE.Shape();

    shape.absarc(0, 0, 2, 0, 2 * Math.PI, true)
    var hole = new THREE.Path();
    hole.absarc(0, 0, 1.6, 0, 2 * Math.PI, false);
    shape.holes.push(hole);

    var options = {
        amount: 0,
        bevelThickness: 0.2,
        bevelSize: 0.3,
        bevelSegments: 30,
        bevelEnabled: true,
        curveSegments: 30,
        steps: 1
    };
    var material = new THREE.LineBasicMaterial({
        color: 0x3DA0DD
    });
    var geometry = new THREE.ExtrudeGeometry(shape, options);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.5, 0.5, 0.5);
    landmark.add(mesh);

    var material = new THREE.MeshBasicMaterial({
        map: new THREE.ImageUtils.loadTexture('img/glow.png'),
        color: 0x0088ff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    var radius = 4;
    var segments = 36;

    var circleGeometry = new THREE.CircleGeometry(radius, segments);
    var circle = new THREE.Mesh(circleGeometry, material);
    landmark.add(circle);

    function getLandmark(name, colorStr) {
        var size = 512;
        var r = size / 2;
        canvas.width = size;
        canvas.height = size;

        var w = 200 + 50 * name.length;
        var h = 120;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(42, 51, 64, 0.5)';
        context.strokeStyle = 'rgba(61, 160, 221, 0.5)';
        context.lineWidth = 5;
        context.rect(r - w / 2, r - h / 2, w, h);
        context.fill();
        context.stroke();

        context.lineWidth = 1;
        context.font = "900 " + r * 0.3 + "px SimHei";
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = "#FFFFFF";
        context.fillText(name, r, r);
        context.strokeText(name, r, r);

        if (sprite.material && sprite.material.map) {
            sprite.material.map.image = canvas;
            sprite.material.map.needsUpdate = true;
        }

        return landmark;
    }

    return getLandmark;
});
