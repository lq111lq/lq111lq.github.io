define(function() {
    function Background() {
        var self = this;
        THREE.Group.call(this);

        var material = new THREE.PointsMaterial({
            size: 16,
            map: Resources.getTexture('star_texture'),
            depthWrite: false,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        var geometry = new THREE.Geometry();

        function getPostion(log, lat, r) {
            var position = new THREE.Vector3(0, 0, 0);
            var x = 0;
            var y = 0;
            var z = 0;

            var y = Math.sin(lat / 180 * Math.PI) * r;
            var r0 = Math.cos(lat / 180 * Math.PI) * r;

            var x = Math.sin(log / 180 * Math.PI) * r0;
            var z = Math.cos(log / 180 * Math.PI) * r0;
            position.set(x, y, z);
            return position;
        }
        for (var i = 0; i < 15000; i++) {
            var angle0 = Math.random() * 360;
            var angle1 = Math.random() * 360;
            var r = Math.random() * 2400 + 600;
            geometry.vertices.push(getPostion(angle0, angle1, r));
        }

        var points = new THREE.Points(geometry, material)
        this.add(points);

        for (var ii = 1; ii <= 4; ii++) {
            var material = new THREE.PointsMaterial({
                size: 2560,
                map: Resources.getTexture('star_cloud_texture_' + ii),
                depthWrite: false,
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending
            });

            var geometry = new THREE.Geometry();

            for (var i = 0; i < 100; i++) {
                var angle0 = Math.random() * 360;
                var angle1 = Math.random() * 360;
                var r = Math.random() * 2400 + 600;
                geometry.vertices.push(getPostion(angle0, angle1, r));
            }

            var points = new THREE.Points(geometry, material)
            this.add(points);
        }

        function bgGroupRotate() {
            var rotation = { y: self.rotation.y };
            new TWEEN.Tween(rotation)
                .to({ y: Math.PI * 2 }, 600000)
                .onUpdate(function() {
                    self.rotation.y = rotation.y;
                })
                .onComplete(function() {
                    self.rotation.y = 0;
                    bgGroupRotate();
                })
                .start();
        }
        bgGroupRotate();
    }
    Background.prototype = Object.create(THREE.Group.prototype);
    Background.prototype.constructor = Background;
    return Background;
});
