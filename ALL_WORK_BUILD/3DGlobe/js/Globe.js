var Globe = (function(argument) {
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
            "vec3 normal = normalize( -vNormal );",
            "vec3 viewPosition = normalize( vViewPosition );",
            "#if MAX_DIR_LIGHTS > 0",
            "vec3 dirDiffuse = vec3( 0.0 );",
            "for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",
            "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
            "vec3 dirVector = normalize( lDirection.xyz );",
            "float dotProduct = dot( viewPosition, dirVector );",
            "dotProduct = 1.0 * max( dotProduct, 0.0 ) + (1.0 - max( -dot( normal, dirVector ), 0.0 ));",
            "dotProduct *= dotProduct;",
            "dirDiffuse += max( 0.5 * dotProduct, 0.0 ) * directionalLightColor[ i ];",
            "}",
            "#endif",
            //Fade out atmosphere at edge
            "float viewDot = abs(dot( normal, viewPosition ));",
            "viewDot = clamp( pow( viewDot + 0.6, 10.0 ), 0.0, 1.0);",
            "vec3 colour = vec3( 0.2, 0.3, 0.4 ) * dirDiffuse;",
            "gl_FragColor = vec4( colour, viewDot );",
            "}"
        ].join("\n"),
    };

    var globeMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 0
    });

    THREE.ImageUtils.loadTexture('img/world.jpg', undefined, function(tex) {
        globeMat.map = tex;
        globeMat.needsUpdate = true;
    });

    THREE.ImageUtils.loadTexture('img/earth_specular_2048.jpg', undefined, function(tex) {
        globeMat.specularMap = tex;
        globeMat.needsUpdate = true;
    });

    THREE.ImageUtils.loadTexture('img/earth_normal_2048.jpg', undefined, function(tex) {
        globeMat.normalMap = tex;
        globeMat.normalScale = new THREE.Vector2(1, 1);
        globeMat.needsUpdate = true;
    });

    var globeAtmoMat = new THREE.ShaderMaterial(atmoShader);

    function Globe() {
        var baseRadius = 100;
        var segments = 100;
        var currentScale = 1;
        var defScaleStep = 0.01;
        var atmoScale = 0.03;
        var geometry = new THREE.SphereGeometry(baseRadius, segments, segments);

        THREE.Group.call(this);
        var earth = new THREE.Mesh(geometry, globeMat);
        earth.rotation.y = 1.5 * Math.PI;
        this.add(earth);

        var atmosphere = new THREE.Mesh(geometry, globeAtmoMat);
        var currentAtmoScale = currentScale + atmoScale;
        atmosphere.scale.set(currentAtmoScale, currentAtmoScale, currentAtmoScale);
        this.add(atmosphere);

        this.getRadius = function() {
            return baseRadius * currentScale;
        };

        this.addNewLayer = function(layerMaterial, scaleStep) {
            currentScale += scaleStep || defScaleStep;
            var layer = new THREE.Mesh(geometry, layerMaterial);
            layer.rotation.y = 1.5 * Math.PI;
            layer.scale.set(currentScale, currentScale, currentScale);
            this.add(layer);

            var currentAtmoScale = currentScale + atmoScale;
            atmosphere.scale.set(currentAtmoScale, currentAtmoScale, currentAtmoScale);

            return this;
        };

        this.addNewLayerOuter = function(layerMaterial, scaleStep) {
            var currentScale = 1 + scaleStep || defScaleStep;
            var layer = new THREE.Mesh(geometry, layerMaterial);
            layer.rotation.y = 1.5 * Math.PI;
            layer.scale.set(currentScale, currentScale, currentScale);
            this.add(layer);

            var currentAtmoScale = currentScale + atmoScale;
            return this;
        };

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
        };

        this.addLandMark = function(name, log, lat, colorStr) { //log 经度 E+ W- lat维度 N+ S-
            var landMark = new Landmark(name, colorStr);
            landMark.name = name;
            landMark.position.copy(getPostion(log, lat, baseRadius * currentScale + 10));
            landMark.scale.set(1, 1, 1);
            landMark.lookAt(this.position);
            this.add(landMark);
        }

        this.getLandMark = function(name) {
            return this.getObjectByName(name);
        }

        this.setLandMarkPosition = function(name, log, lat) {
            var landMark = this.getObjectByName(name);
            landMark && landMark.position.copy(getPostion(log, lat, baseRadius * currentScale + 10));
        }

        this.addLine = function(fName, tName, h, color) {
            var v0 = this.getObjectByName(fName).position;
            var v1 = this.getObjectByName(tName).position;

            var h = h || 30 + Math.random() * 15;
            var dx = v1.x - v0.x;
            var dy = v1.y - v0.y;
            var dz = v1.z - v0.z;
            var CustomSinCurve = THREE.Curve.create(
                function(scale) { //custom curve constructor
                    this.scale = (scale === undefined) ? 1 : scale;
                },

                function(t) { //getPoint: t is between 0-1
                    var tx = v0.x + dx * t,
                        ty = v0.y + dy * t,
                        tz = v0.z + dz * t;
                    var al = t * v0.length() + (1 - t) * v1.length();
                    var dl = h;
                    var r = new THREE.Vector3(tx, ty, tz);
                    var s = 1 - 4 * Math.pow(t - 0.5, 2);

                    r.multiplyScalar(al / r.length());
                    r.multiplyScalar(1 + s * h / r.length());
                    return r;
                }
            );
            var path = new CustomSinCurve(1);
            // var geometry = new THREE.TubeGeometry(
            //     path, //path
            //     100, //segments
            //     1, //radius
            //     1, //radiusSegments
            //     false //closed
            // );

            var lineGeometry = new THREE.Geometry();
            for (var i = 0; i < 101; i++) {

                lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

                var vColor = new THREE.Color(color || 0xffff00);
                var hsl = vColor.getHSL();

                vColor.setHSL(hsl.h * (0.2 * i / 101 + 0.9), hsl.s * (0.5 * i / 101 + 0.5), hsl.l);
                lineGeometry.colors.push(vColor);

            };

            var lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                vertexColors: THREE.VertexColors
            });
            lineMaterial.transparent = true;
            lineMaterial.opacity = 0.5;
            var line = new THREE.Line(lineGeometry, lineMaterial);

            line.userData.allVertices = new THREE.TubeGeometry(path, 100, 1, 1, false).vertices;
            line.userData.originalGeometryColor = lineGeometry.colors;
            line.position.set(0, 0, 0);
            line.name = fName + '-' + tName;
            this.add(line);

            var posSrc = {value:0};
            var tween = new TWEEN.Tween(posSrc).to({value:1}, 3000);
            tween.easing(TWEEN.Easing.Sinusoidal.InOut);

            var tweenBack = new TWEEN.Tween(posSrc).to({value:0}, 0);
            tweenBack.easing(TWEEN.Easing.Sinusoidal.InOut);

            tween.chain(tweenBack);
            tweenBack.chain(tween);
            var onUpdate = function() {
                //console.log(posSrc.value);
                var cp = posSrc.value;
                var ocs = line.userData.originalGeometryColor;
                line.geometry.colors = ocs.map(function function_name(oc, i) {
                    var hsl = oc.getHSL();
                    if (i == Math.floor(101 * cp) - 1) {
                        var nc = new THREE.Color();
                        nc.setHSL(hsl.h, hsl.s, 0.8);
                        return nc;
                    }
                    if (i == Math.floor(101 * cp) - 2) {
                        var nc = new THREE.Color();
                        nc.setHSL(hsl.h, hsl.s, 1);
                        return nc;
                    }
                    if (i == Math.floor(101 * cp) - 3) {
                        var nc = new THREE.Color();
                        nc.setHSL(hsl.h, hsl.s, 0.8);
                        return nc;
                    }
                    if (i == Math.floor(101 * cp) - 4) {
                        var nc = new THREE.Color();
                        nc.setHSL(hsl.h, hsl.s, 0.6);
                        return nc;
                    }
                    return oc;
                })
                line.geometry.colorsNeedUpdate = true;
            }
            tween.onUpdate(onUpdate);
            tween.start();
        }

        this.setLineProgress = function(fName, tName, pp) {
            var cp = Math.max(pp * 2 - 1, 0);
            var vp = pp;

            var v0 = this.getObjectByName(fName).position;
            var v1 = this.getObjectByName(tName).position;
            var line = this.getObjectByName(fName + '-' + tName);
            //var lineMaterial = line.userData.lineMaterial;
            //this.remove(line);
            var allVertices = line.userData.allVertices;
            var vertices = allVertices.slice(0, allVertices.length * vp);
            var end = vertices[vertices.length - 1] || new THREE.Vector3();
            for (var i = 0; i < allVertices.length * (1 - vp); i++) {
                vertices.push(end);
            }
            //
            line.geometry.vertices = vertices;
            line.geometry.verticesNeedUpdate = true;
        }
        this.setLinePisappear = function(fName, tName, p) {
            var v0 = this.getObjectByName(fName).position;
            var v1 = this.getObjectByName(tName).position;
            var line = this.getObjectByName(fName + '-' + tName);
            var lineMaterial = line.userData.lineMaterial;
            this.remove(line);

            var allVertices = line.userData.allVertices;
            var vertices = allVertices.slice(allVertices.length * p, allVertices.length);

            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices = lineGeometry.vertices.concat(vertices);

            var line = new THREE.Line(lineGeometry, lineMaterial);
            line.userData.allVertices = allVertices;
            line.userData.lineMaterial = lineMaterial;
            line.position.set(0, 0, 0);
            line.name = fName + '-' + tName;
            this.add(line);
        }
    }
    Globe.prototype = Object.create(THREE.Group.prototype);
    Globe.prototype.constructor = Globe;
    return Globe;
})();
