var DataCloud = (function() {
    var vertexshader = ['',
        'attribute float size;',
        'attribute vec3 customColor;',
        'varying vec3 vColor;',
        'void main() {',
        '    vColor = customColor;',
        '    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '    gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );',
        '    gl_Position = projectionMatrix * mvPosition;',
        '}'
    ].join('');

    var fragmentshader = ['',
        'uniform vec3 color;',
        'uniform sampler2D texture;',
        'varying vec3 vColor;',
        'void main() {',
        '    gl_FragColor = vec4(color * vColor, 1.0);',
        '    gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);',
        '}'
    ].join('');

    function DataCloud(data, framePrograms) {
        var self = this;
        var geometry = new THREE.BufferGeometry();
        this.data = data;
        this.frames = framePrograms.map(function(d, i) {
            var frame = {};
            frame.name = d.name;
            frame.vertices = new Float32Array(dataArr.length * 3);
            frame.colors = new Float32Array(dataArr.length * 3);
            frame.size = new Float32Array(dataArr.length);
            frame.frameProgram = d;
            return frame;
        });
        this.framesMap = {};
        this.frames.forEach(function(d, i) {
            self.framesMap[d.name] = d;
        });
        this.frames.unshift((function() {
            var d = framePrograms[0];
            var frame = {};
            frame.name = '';
            frame.vertices = new Float32Array(dataArr.length * 3);
            frame.colors = new Float32Array(dataArr.length * 3);
            frame.size = new Float32Array(dataArr.length);
            frame.frameProgram = d;
            return frame;
        })());
        this.nextFramesNames = [];
        for (var i = 0; i < dataArr.length; i++) {
            this.frames.forEach(function(frame) {
                var frameProgram = frame.frameProgram;
                var result = frameProgram(dataArr[i]);
                frame.size[i] = result.size;
                frame.vertices[i * 3 + 0] = result.position[0];
                frame.vertices[i * 3 + 1] = result.position[1];
                frame.vertices[i * 3 + 2] = result.position[2];
                frame.colors[i * 3 + 0] = result.color[0];
                frame.colors[i * 3 + 1] = result.color[1];
                frame.colors[i * 3 + 2] = result.color[2];
            });
        }

        geometry.addAttribute('position', new THREE.BufferAttribute(this.frames[0].vertices, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(this.frames[0].colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(this.frames[0].size, 1))

        var uniforms = {
            color: { type: "c", value: new THREE.Color(0xffffff) },
            texture: { type: "t", value: THREE.ImageUtils.loadTexture("img/dot.png") }
        };

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexshader,
            fragmentShader: fragmentshader,
        });

        THREE.Points.call(this, geometry, material);

        requestAnimationFrame(function() {
            self.doAnimation();
            requestAnimationFrame(arguments.callee);
        });
    }

    DataCloud.prototype = Object.create(THREE.Points.prototype);
    DataCloud.prototype.constructor = DataCloud;
    DataCloud.prototype.doAnimation = function() {
        this.animate();
    }
    DataCloud.prototype.animate = function() {
        if (this.nextFramesNames.length == 0) return;
        var nextFrameName = this.nextFramesNames[0];
        var nextFrame = this.framesMap[nextFrameName];
        if (!nextFrame) {
            this.nextFramesNames.shift();
            return;
        }
        var error = 1;
        var increment = 10;

        var positions = this.geometry.attributes.position.array;
        var destination = nextFrame.vertices;
        var completed = 0;
        for (var v = 0; v < positions.length / 3; v++) {

            var a = false,
                b = false,
                c = false;
            easing = 0.2 + (v % 1000) / 1000;
            if (Math.abs(positions[v * 3 + 0] - destination[v * 3 + 0]) > error) positions[v * 3 + 0] += (destination[v * 3 + 0] - positions[v * 3 + 0]) / increment * easing;
            else {
                positions[v * 3 + 0] = destination[v * 3 + 0];
                a = true;
            }
            if (Math.abs(positions[v * 3 + 1] - destination[v * 3 + 1]) > error) positions[v * 3 + 1] += (destination[v * 3 + 1] - positions[v * 3 + 1]) / increment * easing;
            else {
                positions[v * 3 + 1] = destination[v * 3 + 1];
                b = true;
            }
            if (Math.abs(positions[v * 3 + 2] - destination[v * 3 + 2]) > error) positions[v * 3 + 2] += (destination[v * 3 + 2] - positions[v * 3 + 2]) / increment * easing;
            else {
                positions[v * 3 + 2] = destination[v * 3 + 2];
                c = true;
            }
            if (a && b && c) {
                completed++;
            }
        }
        console.log(completed + '/' + positions.length / 3);
        if (completed == positions.length / 3) {
            console.log('ok');
            this.nextFramesNames.shift();
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
    return DataCloud;
})();
