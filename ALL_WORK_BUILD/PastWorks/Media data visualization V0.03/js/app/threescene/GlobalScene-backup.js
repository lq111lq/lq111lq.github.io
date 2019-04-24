define(
    [
        'threescene/components/ScienceVessel',
        'threescene/components/Background',
        'threescene/components/Globe',
        'threescene/components/HotspotMark',
        'threescene/components/Landmark'
    ],
    function(
        ScienceVessel,
        Background,
        Globe,
        HotspotMark,
        Landmark
    ) {
        function GlobalScene(container) {
            var self = this;
            var width = container.clientWidth;
            var height = container.clientHeight;

            var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            var camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 300000);
            var scene = new THREE.Scene();

            container.appendChild(renderer.domElement);
            renderer.setSize(width, height);
            renderer.setClearColor(0x010209, 1);
            camera.fog = new THREE.FogExp2(0x182B3A, 0.0005);
            scene.add(camera);

            camera.position.x = 31;
            camera.position.y = 10;
            camera.position.z = 190;

            var lensFlareGroup = new THREE.Group();
            camera.add(lensFlareGroup);
            var spriteMaterial = new THREE.SpriteMaterial({
                map: Resources.getTexture('th'),
                useScreenCoordinates: false,
                color: 0xFFFFFF,
                transparent: false,
                blending: THREE.AdditiveBlending
            });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(9.6, 5.4, 1.0);
            sprite.position.set(0, 0, -1);
            lensFlareGroup.add(sprite);

            var flareColor = new THREE.Color(0xBD72E6);
            var lensFlare = new THREE.LensFlare(Resources.getTexture('lensflare3'), 40, 0.1, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 50, 0.2, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 60, 0.3, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 70, 0.4, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 80, 0.5, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 90, 0.6, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 100, 0.7, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 110, 0.8, THREE.AdditiveBlending, flareColor);
            lensFlare.add(Resources.getTexture('hexangle'), 120, 0.9, THREE.AdditiveBlending, flareColor);
            lensFlareGroup.add(lensFlare);
            lensFlareGroup.position.set(8.6, 4.9, -20);

            var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.copy(camera.position);
            scene.add(directionalLight);

            var ambiColor = "#ffffff";
            var ambientLight = new THREE.AmbientLight(ambiColor);
            scene.add(ambientLight);

            var globeGroup = new THREE.Group();
            directionalLight.target = globeGroup;
            scene.add(globeGroup);

            var globe = new Globe();
            globeGroup.add(globe);

            scene.add(new Background());
            var globeGroupRotateTween = null;

            function globeGroupRotate() {
                var rotation = { y: globeGroup.rotation.y };
                var time = 60000 * Math.max((1 - globeGroup.rotation.y / (Math.PI * 2)), 0);
                globeGroupRotateTween = new TWEEN.Tween(rotation)
                    .to({ y: Math.PI * 2 }, time)
                    .onUpdate(function() {
                        globeGroup.rotation.y = rotation.y;
                    })
                    .onComplete(function() {
                        globeGroup.rotation.y = 0;
                        globeGroupRotate()
                    })
                    .start();
            }

            function globeGroupRotateStop() {
                globeGroupRotateTween && globeGroupRotateTween.stop();
            }

            var rotationY = 0;

            function focus(fn) {
                var position = {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                };

                new TWEEN.Tween(position)
                    .to({
                        x: 40,
                        y: 10,
                        z: 130
                    }, 1000)
                    .onUpdate(function() {
                        camera.position.x = position.x;
                        camera.position.y = position.y;
                        camera.position.z = position.z;
                    })
                    .start();

                rotationY = globeGroup.rotation.y;

                if (
                    Math.abs(globeGroup.rotation.y - Math.PI * 0.2) > Math.PI
                ) {
                    if (globeGroup.rotation.y > Math.PI * 0.2) {
                        globeGroup.rotation.y -= Math.PI * 2;
                    } else {
                        globeGroup.rotation.y += Math.PI * 2;
                    }

                }

                globeGroupRotateStop();
                var rotation = {
                    x: globeGroup.rotation.x,
                    y: globeGroup.rotation.y
                };
                new TWEEN.Tween(rotation)
                    .to({
                        x: -Math.PI * 0.1,
                        y: Math.PI * 0.1
                    }, 1000)
                    .onUpdate(function() {
                        globeGroup.rotation.x = rotation.x;
                        globeGroup.rotation.y = rotation.y;
                    })
                    .onComplete(function() {
                        fn && fn();
                    })
                    .start();
            }

            function blur() {
                var position = {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                };

                new TWEEN.Tween(position)
                    .to({
                        x: 31,
                        y: 10,
                        z: 190
                    }, 1000)
                    .onUpdate(function() {
                        camera.position.x = position.x;
                        camera.position.y = position.y;
                        camera.position.z = position.z;
                    })
                    .start();

                if (
                    Math.abs(globeGroup.rotation.y - rotationY) > Math.PI
                ) {
                    if (globeGroup.rotation.y > rotationY) {
                        globeGroup.rotation.y -= Math.PI * 2;
                    } else {
                        globeGroup.rotation.y += Math.PI * 2;
                    }
                }

                var rotation = {
                    x: globeGroup.rotation.x,
                    y: globeGroup.rotation.y
                };
                new TWEEN.Tween(rotation)
                    .to({
                        x: 0,
                        y: rotationY
                    }, 1000)
                    .onUpdate(function() {
                        globeGroup.rotation.y = rotation.y;
                    })
                    .onComplete(function() {
                        globeGroupRotateStop()
                        globeGroupRotate();
                    })
                    .start();
            }

            globeGroupRotate();

            function render() {
                //TWEEN.update();
                requestAnimationFrame(render);
                renderer.render(scene, camera);
            }
            render();
            this.showHourlyNews = function(hn) {
                var self = this;
                var local = hn.local;
                var title = hn.title;
                var content = hn.content;
                var time = hn.time;
                var type = hn.type;
                // self.landMark && scene.remove(self.landMark);
                // self.hotspotMark && scene.remove(self.hotspotMark);
                focus(function() {

                    globe.trunTo(local.log, local.lat, function() {
                        console.log(local);

                    //     var r0 = globe.rotation;
                    //     var r1 = globeGroup.rotation;
                    //     var r2 = new THREE.Euler(r0.x + r1.x, r0.y + r1.y, r0.z + r1.z, 'XYZ');

                    //     var position = globe.getPostion(local.log, local.lat, 1);
                    //     var position = position.applyEuler(r0);
                    //     var position = position.applyEuler(r1);

                    //     var landMark = new Landmark(local.name, '#00FFFF');
                    //     landMark.scale.set(0.5, 0.5, 0.5)
                    //     landMark.position.copy(position);
                    //     landMark.lookAt(new THREE.Vector3(0, 0, 0));
                    //     scene.add(landMark);
                    //     self.landMark = landMark;

                    //     var hotspotMark = new HotspotMark(title, content, time, type);

                    //     hotspotMark.position.copy(position);
                    //     hotspotMark.rotation.set(0, 45 * Math.PI / 180, 0);
                    //     hotspotMark.scale.set(0, 0, 0);
                    //     scene.add(hotspotMark);
                    //     self.hotspotMark = hotspotMark;

                    //     var p = { v: 0 };
                    //     new TWEEN.Tween(p)
                    //         .to({ v: 1 }, 1000)
                    //         .onUpdate(function() {
                    //             var v = p.v;
                    //             var r = 1 - v;
                    //             hotspotMark.scale.set(v, v, v);
                    //             hotspotMark.position.set(
                    //                 position.x * r + 40 * v,
                    //                 position.y * r + 10 * v,
                    //                 position.z * r + 50 * v
                    //             );
                    //         })
                    //         .start();

                    //     var r = { v: 45 * Math.PI / 180 };
                    //     new TWEEN.Tween(r)
                    //         .to({ v: 25 * Math.PI / 180 }, 10000)
                    //         .onUpdate(function() {
                    //             var v = r.v;
                    //             hotspotMark.rotation.set(0, v, 0);
                    //         })
                    //         .start();
                    // });
                });
            }
        }

        return GlobalScene;
    })
