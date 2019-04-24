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

    var globeMat = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        shininess: 0,
        transparent: true,
        side: THREE.DoubleSide
    });

    THREE.ImageUtils.loadTexture('img/globe-4.jpg', undefined, function(tex) {
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

    THREE.ImageUtils.loadTexture('img/bump.jpg', undefined, function(tex) {
        globeMat.bumpMap = tex;
        globeMat.bumpMapScale = 1;
        globeMat.needsUpdate = true;
    });

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

        var baseRadius = this.r = 50;
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

        this.sphereCloudsMesh1 = new THREE.Mesh(geometry, earthCloudsMat);
        this.sphereCloudsMesh1.rotation.y = 1.5 * Math.PI;
        this.sphereCloudsMesh1.scale.set(1.02, 1.02, 1.02);
        this.add(this.sphereCloudsMesh1);

        var atmosphere = new THREE.Mesh(geometry, globeAtmoMat);
        atmosphere.scale.set(1.05, 1.05, 1.05);
        this.add(atmosphere);

        this.showHourlyNews = function(hn) {
            self.trunTo(hn.local.log, hn.local.lat);

            var map = new THREE.TextureLoader().load("img/disc.png");
            var material = new THREE.SpriteMaterial({ map: map, color: 0x0088ff, fog: true });
            if (!this.localPoint) {
                this.localPoint = new THREE.Sprite(material);
                this.add(this.localPoint);
            };

            this.localPoint.position.copy(this.getPostion(hn.local.log, hn.local.lat, 0.2));
            this.localPoint.scale.set(0.2, 0.2, 0.2)

            // window.setTimeout(function() {
            //     self.reposition();
            // }, 10000)
        }

        function render() {
            // if (!newsNodes.length) {
            //     self.rotation.y += 0.0025;
            // } else {
            //     self.rotation.y += 0.00125;
            // }
            self.sphereCloudsMesh1.rotation.y += 0.001;
            requestAnimationFrame(render);
        }
        render();
    }


    Globe.prototype = Object.create(THREE.Group.prototype);
    Globe.prototype.constructor = Globe;
    Globe.prototype.trunTo = function(log, lat, fn) {

        var rotation = {
            y: this.position.y,
            z: this.position.z,
            rx: this.rotation.x,
            ry: this.rotation.y
        }
        var targetRotation = {
            y: -52,
            z: 650,
            ry: (-log + 0) / 180 * Math.PI, //经度
            rx: 0 + (lat - 60) / 180 * Math.PI //维度
        }

        var self = this;
        var tween = new TWEEN.Tween(rotation)
            .to(targetRotation, 1000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function() {
                self.rotation.x = rotation.rx;
                self.rotation.y = rotation.ry;
                self.position.y = rotation.y;
                self.position.z = rotation.z;
            })
            .onComplete(function() {
                if (fn) {
                    fn();
                }
            });
        tween.start();
    }
    Globe.prototype.reposition = function() {
        this.position.y = -15;
        this.position.z = 0;
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
