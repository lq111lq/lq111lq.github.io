define(['threescene/Resources', 'threescene/components/HotspotMark'], function(Resources, HotspotMark) {
    var atmoShader = {
        side: THREE.BackSide,
        // blending: THREE.AdditiveBlending,
        transparent: true,
        lights: true,
        blending: THREE.AdditiveBlending,
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
            "   vec3 colour = vec3( 0.05, 0.1, 0.1 ) * dirDiffuse;",
            "   gl_FragColor = vec4( colour, viewDot );",
            "}"
        ].join("\n"),
    };

    var earthLightsMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false
    });

    THREE.ImageUtils.loadTexture('img/earth_lights_2048.png', undefined, function(tex) {
        earthLightsMat.map = tex;
        earthLightsMat.needsUpdate = true;
    });

    var globeAtmoMat = new THREE.ShaderMaterial(atmoShader);

    function Globe() {
        THREE.Group.call(this);

        var self = this;

        var baseRadius = this.r = 50;
        var segments = 256;
        var atmoScale = 1.05;
        var geometry = new THREE.SphereGeometry(baseRadius, segments, segments);

        var globeMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 0,
            transparent: true,
            side: THREE.DoubleSide
        });

        globeMat.map = Resources.getTexture('earth_texture');
        globeMat.specularMap = Resources.getTexture('earth_specular_texture');
        globeMat.bumpMap = Resources.getTexture('earth_bump_texture');
        globeMat.bumpMapScale = 1;
        globeMat.needsUpdate = true;

        var earth = new THREE.Mesh(geometry, globeMat);
        earth.rotation.y = 1.5 * Math.PI;
        this.add(earth);

        var earthCloudsMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        earthCloudsMat.map = Resources.getTexture('earth_clouds_texture');
        earthCloudsMat.needsUpdate = true;

        var sphereCloudsMesh = new THREE.Mesh(geometry, earthCloudsMat);
        sphereCloudsMesh.rotation.y = 1.5 * Math.PI;
        sphereCloudsMesh.scale.set(1.002, 1.002, 1.002);
        this.add(sphereCloudsMesh);

        function sphereCloudRotate() {
            var rotation = { y: sphereCloudsMesh.rotation.y };
            new TWEEN.Tween(rotation)
                .to({ y: "+" + Math.PI * 2 }, 600000)
                .onUpdate(function() {
                    sphereCloudsMesh.rotation.y = rotation.y;
                })
                .onComplete(sphereCloudRotate)
                .start();
        }
        sphereCloudRotate();

        var spriteMaterial = new THREE.SpriteMaterial({
            map: Resources.getTexture('glow'),
            color: 0x0088ff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(125, 125, 1.0);
        this.add(sprite);

        // var material = new THREE.PointsMaterial({
        //     size: 0.01,
        //     sizeAttenuation: false,
        //     color: 0x0088ff
        // });
        // var points = this.points = new THREE.Points(new THREE.SphereGeometry(50, 60, 60), material)
        // points.scale.set(1.1, 1.1, 1.1);
        // this.add(points);
    }


    Globe.prototype = Object.create(THREE.Group.prototype);
    Globe.prototype.constructor = Globe;
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
    Globe.prototype.trunTo = function(log, lat, fn) {
        var self = this;
        var rotation = {
            rx: this.rotation.x,
            ry: this.rotation.y,
            s: 1.1
        }
        var targetRotation = {
            ry: -log / 180 * Math.PI, //经度
            rx: lat / 180 * Math.PI, //维度
            s: 100.1
        }

        var tween = new TWEEN.Tween(rotation)
            .to(targetRotation, 1000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function() {
                self.rotation.x = rotation.rx;
                self.rotation.y = rotation.ry;
                //self.points.scale.set(rotation.s, rotation.s, rotation.s);
            })
            .onComplete(function() {
                if (fn) {
                    fn();
                }
            });
        tween.start();
    };
    Globe.prototype.showHourlyNews = function(hn) {
        var content = hn.content;
        var local = hn.local;

        this.localPoint && this.remove(this.localPoint);
        this.hotspotMark && this.remove(this.hotspotMark);
        this.trunTo(local.log, local.lat);

        // var map = new THREE.TextureLoader().load("img/disc.png");
        // var material = new THREE.SpriteMaterial({ map: map, color: 0x0088ff, fog: true });
        // var localPoint = new THREE.Sprite(material);
        // localPoint.position.copy(this.getPostion(local.log, local.lat, 1));
        // localPoint.scale.set(0.5, 0.5, 0.5)
        // this.add(localPoint);
        // this.localPoint = localPoint;

        // var hotspotMark = new HotspotMark(content);
        // hotspotMark.position.copy(this.getPostion(local.log, local.lat, 10));
        // hotspotMark.lookAt(this.getPostion(local.log, local.lat, 100));
        // hotspotMark.scale.set(0,0,0);
        // this.add(hotspotMark);

        // var t = { value: 0 };
        // var self = this;
        // new TWEEN.Tween(t).to({ value: 1 }, 2000)
        //     .onUpdate(function() {
        //         hotspotMark.scale.set(t.value * 0.7,t.value * 0.7,t.value * 0.7);
        //         hotspotMark.position.copy(self.getPostion(local.log + 10 * t.value, local.lat - 8 * t.value, 30));
        //         hotspotMark.lookAt(self.getPostion(local.log + 10 * t.value, local.lat - 8 * t.value, 100));
        //     }).start();

        // this.hotspotMark = hotspotMark;

        // window.hotspotMark = hotspotMark;

    };
    return Globe;
})
