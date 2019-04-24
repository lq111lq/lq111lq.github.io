define(['threescene/HotspotMark'], function(HotspotMark) {
    var atmoShader = {
        side: THREE.BackSide,
        // blending: THREE.AdditiveBlending,
        transparent: true,
        lights: true,
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["common"],
            THREE.UniformsLib["lights"],
        ]),
        vertexShader: [
            "varying vec3 vViewPosition;",
            "varying vec3 vNormal;",
            THREE.ShaderChunk["lights_phong_pars_vertex"],
            "void main() {",
            THREE.ShaderChunk["beginnormal_vertex"],
            THREE.ShaderChunk["defaultnormal_vertex"],
            "   vNormal = normalize( transformedNormal );",
            "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
            "vViewPosition = -mvPosition.xyz;",
            "gl_Position = projectionMatrix * mvPosition;",
            "}"
        ].join("\n"),
        fragmentShader: [
            THREE.ShaderChunk["lights_phong_pars_fragment"],
            "void main() {",
            "   vec3 normal = normalize( -vNormal );",
            "   vec3 viewPosition = normalize( vViewPosition );",
            "   #if MAX_DIR_LIGHTS > 0",
            "   vec3 dirDiffuse = vec3( 0.0 );",
            "   for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",
            "       vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
            "       vec3 dirVector = normalize( lDirection.xyz );",
            "       float dotProduct = dot( viewPosition, dirVector );",
            "       dotProduct = 1.0 * max( dotProduct, 0.0 ) + (1.0 - max( -dot( normal, dirVector ), 0.0 ));",
            "   dotProduct *= dotProduct;",
            "   dirDiffuse += max( 0.5 * dotProduct, 0.0 ) * directionalLightColor[ i ];",
            "   }",
            "   #endif",
            //Fade out atmosphere at edge
            "   float viewDot = abs(dot( normal, viewPosition ));",
            "   viewDot = clamp( pow( viewDot + 0.6, 10.0 ), 0.0, 1.0);",
            "   vec3 colour = vec3( 0.0, 0.3, 0.6 ) * dirDiffuse;",
            "   gl_FragColor = vec4( colour, viewDot );",
            "}"
        ].join("\n"),
    };

    var globeMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        shininess: 0,
        transparent: true,
        side: THREE.DoubleSide
    });

    THREE.ImageUtils.loadTexture('img/globe-4.png', undefined, function(tex) {
        globeMat.map = tex;
        globeMat.needsUpdate = true;
    });

    THREE.ImageUtils.loadTexture('img/earth_specular_2048.jpg', undefined, function(tex) {
        globeMat.specularMap = tex;
        globeMat.needsUpdate = true;
    });

    // THREE.ImageUtils.loadTexture('img/earth_normal_2048.jpg', undefined, function(tex) {
    //     globeMat.normalMap = tex;
    //     globeMat.normalScale = new THREE.Vector2(1, 1);
    //     globeMat.needsUpdate = true;
    // });

    // THREE.ImageUtils.loadTexture('img/bump.jpg', undefined, function(tex) {
    //     globeMat.bumpMap = tex;
    //     globeMat.bumpMapScale = 1;
    //     globeMat.needsUpdate = true;
    // });

    var earthLightsMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false
    });

    THREE.ImageUtils.loadTexture('img/earth_lights_2048.png', undefined, function(tex) {
        earthLightsMat.map = tex;
        earthLightsMat.needsUpdate = true;
    });

    var earthCloudsMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        blending: THREE.NormalBlending,
        transparent: true,
        opacity: 0.5,
        depthTest: false
    });

    THREE.ImageUtils.loadTexture('img/earth_clouds_2048.png', undefined, function(tex) {
        earthCloudsMat.map = tex;
        earthCloudsMat.needsUpdate = true;
    });


    var globeAtmoMat = new THREE.ShaderMaterial(atmoShader);

    function Globe() {
        THREE.Group.call(this);

        var self = this;

        var baseRadius = this.r = 70;
        var segments = 128;
        var atmoScale = 1.05;
        var geometry = new THREE.SphereGeometry(baseRadius, segments, segments);

        var earth = new THREE.Mesh(geometry, globeMat);
        earth.rotation.y = 1.5 * Math.PI;
        this.add(earth);

        // var sphereLightsMesh = new THREE.Mesh(geometry, earthLightsMat);
        // sphereLightsMesh.rotation.y = 1.5 * Math.PI;
        // sphereLightsMesh.scale.set(1.03, 1.03, 1.03);
        // this.add(sphereLightsMesh);

        var sphereCloudsMesh = this.sphereCloudsMesh = new THREE.Mesh(geometry, earthCloudsMat);
        sphereCloudsMesh.rotation.y = 1.5 * Math.PI;
        sphereCloudsMesh.scale.set(1.03, 1.03, 1.03);
        //this.add(sphereCloudsMesh);

        var atmosphere = new THREE.Mesh(geometry, globeAtmoMat);
        atmosphere.scale.set(1.05, 1.05, 1.05);
        this.add(atmosphere);

        var force = d3.layout.force()
            .gravity(0)
            .friction(0.9)
            .charge(-2)
            .size([180, 90]);

        var newsNodes = [];
        var waitNewsNodes = [];
        var maxDisplayNumber = 3;

        function loadNewsNode() {
            var pushed = false;
            while (newsNodes.length < maxDisplayNumber) {
                var news = waitNewsNodes.shift();
                if (news) {
                    news.life = 300 * Math.random() + 300;
                    news.x = news.local.log;
                    news.y = news.local.lat;
                    newsNodes.push(news);
                    pushed = true;
                } else {
                    break;
                }
            }
            if (pushed) {
                var center = { log: 0, lat: 0 };
                newsNodes.forEach(function(node) {
                    center.log += node.local.log / newsNodes.length;
                    center.lat += node.local.lat / newsNodes.length;
                })
                self.trunTo(center.log, center.lat);

                force.nodes(newsNodes).start();
            }
        }

        this.addHourlyNews = function(hns) {
            waitNewsNodes = waitNewsNodes.concat(hns);
            loadNewsNode();
        }

        function render() {

            newsNodes.forEach(function(node) {
                if (!node.localPoint) {
                    var map = new THREE.TextureLoader().load("img/disc.png");
                    var material = new THREE.SpriteMaterial({ map: map, color: 0x0088ff, fog: true });
                    var localPoint = node.localPoint = new THREE.Sprite(material);
                    self.add(localPoint);
                    localPoint.position.copy(self.getPostion(node.local.log, node.local.lat, 1));
                    localPoint.scale.set(2, 2, 2)
                }

                if (!node.hotspotMark) {
                    var map = new THREE.TextureLoader().load("img/disc.png");
                    var hotspotMark = node.hotspotMark = new HotspotMark(node.content);
                    self.add(hotspotMark);
                    hotspotMark.position.copy(self.getPostion(node.x, node.y, 50));
                }

                if (node.line) {
                    self.remove(node.line);
                }
                node.hotspotMark.position.copy(self.getPostion(node.x, node.y, 50));

                var material = new THREE.LineBasicMaterial({
                    color: 0x0088ff,
                    transparent: true,
                    opacity: 1
                });
                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    self.getPostion(node.local.log, node.local.lat, 0),
                    self.getPostion(node.x, node.y, 50)
                );

                node.line = new THREE.Line(geometry, material);
                self.add(node.line);
            });
            var deleted = false;
            newsNodes = newsNodes.filter(function(node) {
                node.life--;
                console.log(node.life);
                if (node.life <= 0) {
                    self.remove(node.hotspotMark);
                    self.remove(node.localPoint);
                    self.remove(node.line);
                    deleted = true;
                    return false;
                }
                return true;
            })
            if (deleted) {
                loadNewsNode();
            }
            if (!newsNodes.length) {
                self.rotation.y += 0.0025;
            } else {
                self.rotation.y += 0.00125;
            }
            sphereCloudsMesh.rotation.y += 0.001;
            TWEEN.update();
            requestAnimationFrame(render);
        }
        render();
    }


    Globe.prototype = Object.create(THREE.Group.prototype);
    Globe.prototype.constructor = Globe;
    Globe.prototype.trunTo = function(log, lat, fn) {
        var rotation = {
            x: this.rotation.x,
            y: this.rotation.y
        }
        var targetRotation = {
            y: (-log + 0) / 180 * Math.PI, //经度
            x: 0 + (lat - 0) / 180 * Math.PI //维度
        }
        while (rotation.y > targetRotation.y){
            targetRotation.y +=  2 * Math.PI
        }
        var self = this;
        var tween = new TWEEN.Tween(rotation)
            .to(targetRotation, 1000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function() {
                self.rotation.x = rotation.x;
                self.rotation.y = rotation.y;
            })
            .onComplete(function() {
                if (fn) {
                    fn();
                }
            });
        tween.start();
    }
    Globe.prototype.getPostion = function(log, lat, h) {
        var position = new THREE.Vector3(0, 0, 0);
        var r = this.r + (h || 0);
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
    return Globe;
})
