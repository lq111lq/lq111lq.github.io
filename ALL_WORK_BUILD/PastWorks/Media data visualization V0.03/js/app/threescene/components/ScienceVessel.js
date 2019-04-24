define(function() {
    function ScienceVessel() {
        THREE.Group.call(this);
        var self = this;

        var dataArr = [];
        for (n in mapData) {
            mapData[n].forEach(function(d, i) {
                dataArr.push(d);
            });
        }
        console.log(dataArr.length);
        var particlesData = [];
        var pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 3,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false
        });

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
        var r = 51;
        var particleCount = dataArr.length;
        var particles = new THREE.BufferGeometry();
        var particlePositions0 = new Float32Array(particleCount * 3);
        var particlePositionsRange1 = new Float32Array(particleCount * 3);
        var particlePositionsRange2 = new Float32Array(particleCount * 3);
        var minDistance = 5;

        for (var i = 0; i < particleCount; i++) {
            var d = dataArr[i];
            var position = getPostion(d.lon, d.lat, r);
            var x = position.x;
            var y = position.y;
            var z = position.z;

            particlePositions0[i * 3] = x;
            particlePositions0[i * 3 + 1] = y;
            particlePositions0[i * 3 + 2] = z;
            particlePositionsRange1[i * 3] = x;
            particlePositionsRange1[i * 3 + 1] = y;
            particlePositionsRange1[i * 3 + 2] = z;

            var position = getPostion(d.lon, d.lat, r + 5);
            particlePositionsRange2[i * 3] = x;
            particlePositionsRange2[i * 3 + 1] = y;
            particlePositionsRange2[i * 3 + 2] = z;
            particlesData.push({
                numConnections: 0
            });
        }
        particles.addAttribute('position', new THREE.BufferAttribute(particlePositions0, 3).setDynamic(true));
        var pointCloud = new THREE.Points(particles, pMaterial);
        //this.add(pointCloud);

        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(particleCount * minDistance * 3);
        var colors = new Float32Array(particleCount * minDistance * 3);

        var vertexpos = 0;
        var colorpos = 0;
        var color = new THREE.Color(0x001234);
        var lineDatas = [];
        var test = {};
        for (var i = 0; i < particleCount; i++) {
            for (var j = 0; j < particleCount; j++) {
                var dx = particlePositions0[i * 3] - particlePositions0[j * 3];
                var dy = particlePositions0[i * 3 + 1] - particlePositions0[j * 3 + 1];
                var dz = particlePositions0[i * 3 + 2] - particlePositions0[j * 3 + 2];
                var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                var particleDataA = particlesData[i];
                var particleDataB = particlesData[j];
                if (
                    dist < minDistance &&
                    particleDataA.numConnections < 10 &&
                    particleDataB.numConnections < 10 &&
                    !test[i + ':' + j] &&
                    !test[j + ':' + i]
                ) {
                    test[i + ':' + j] = {};
                    //color.offsetHSL(0, dist / minDistance, 0);
                    particleDataA.numConnections++;
                    particleDataB.numConnections++;

                    positions[vertexpos++] = particlePositions0[i * 3];
                    positions[vertexpos++] = particlePositions0[i * 3 + 1];
                    positions[vertexpos++] = particlePositions0[i * 3 + 2];

                    positions[vertexpos++] = particlePositions0[j * 3];
                    positions[vertexpos++] = particlePositions0[j * 3 + 1];
                    positions[vertexpos++] = particlePositions0[j * 3 + 2];

                    colors[colorpos++] = color.r;
                    colors[colorpos++] = color.g;
                    colors[colorpos++] = color.b;

                    colors[colorpos++] = color.r;
                    colors[colorpos++] = color.g;
                    colors[colorpos++] = color.b;
                    lineDatas.push({ i: i, j: j });
                    console.log(vertexpos);
                }
            }
        }
        console.log(JSON.stringify(lineDatas));
        console.log(JSON.stringify(positions));
        console.log(JSON.stringify(colors));
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true));

        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        linesMesh = new THREE.LineSegments(geometry, material);
        this.add(linesMesh);

        function animate() {
            var time = Date.now() * 0.001;
            var t0 = Math.abs(Math.sin(0.5 * time));
            var t1 = 1 - t0;
            // self.rotation.x = 0.25 * time;
            requestAnimationFrame(animate);
            var particlePositions = pointCloud.geometry.attributes.position;
            var particlePositionsArray = particlePositions.array;
            for (var i = 0; i * 3 + 3 <= particlePositionsArray.length; i = i + 2) {
                particlePositionsArray[i * 3] = particlePositionsRange1[i * 3] * t0 + particlePositionsRange2[i * 3] * t1;
                particlePositionsArray[i * 3 + 1] = particlePositionsRange1[i * 3 + 1] * t0 + particlePositionsRange2[i * 3 + 1] * t1;
                particlePositionsArray[i * 3 + 2] = particlePositionsRange1[i * 3 + 2] * t0 + particlePositionsRange2[i * 3 + 2] * t1;
            }
            particlePositions.needsUpdate = true;

            var linesMeshPositions = linesMesh.geometry.attributes.position;
            var linesMeshPositionsArray = linesMeshPositions.array;
            for (var ii = 0; ii < lineDatas.length; ii++) {
                var lineData = lineDatas[ii];
                var i = lineData.i;
                var j = lineData.j;

                linesMeshPositionsArray[ii * 6 + 0] = particlePositionsArray[i * 3];
                linesMeshPositionsArray[ii * 6 + 1] = particlePositionsArray[i * 3 + 1];
                linesMeshPositionsArray[ii * 6 + 2] = particlePositionsArray[i * 3 + 2];

                linesMeshPositionsArray[ii * 6 + 3] = particlePositionsArray[j * 3];
                linesMeshPositionsArray[ii * 6 + 4] = particlePositionsArray[j * 3 + 1];
                linesMeshPositionsArray[ii * 6 + 5] = particlePositionsArray[j * 3 + 2];
            }
            linesMeshPositions.needsUpdate = true;
        }
        animate();
    }

    ScienceVessel.prototype = Object.create(THREE.Group.prototype);
    ScienceVessel.prototype.constructor = ScienceVessel;
    return ScienceVessel;
});
