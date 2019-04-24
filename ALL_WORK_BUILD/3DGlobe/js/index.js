function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
}
var stats = initStats();

var threeScene = (function() {
    var threeScene = {};

    var container = document.getElementById('container');
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);

    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);

    container.appendChild(renderer.domElement);

    var globe = new Globe();
    scene.add(globe);

    var points = new THREE.Points(new THREE.SphereGeometry(110, 96, 48),new THREE.PointsMaterial({color:0x333333}));
    scene.add(points);

    var light = LightCreator.creat(globe);
    scene.add(light);

    function render() {
        stats.update();
        TWEEN.update();
        requestAnimationFrame(render);
        MouseControl.updateCamera(camera);
        renderer.render(scene, camera);
    }
    render();
    threeScene.globe = globe;
    return threeScene;
})();


(function(threeScene) {
    var width = 2048;
    var height = 1024;

    var svg = d3.select(document.createElement('svg'))
        .attr("width", width)
        .attr("height", height);
    var g = svg.append("g")
        .attr("transform", "translate(0,0)");

    var projection = d3.geo.equirectangular()
        .center([0, 0])
        .scale(327)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var update = g.selectAll("path")
        .data(worldGeo.features);
    var enter = update.enter();

    var c = [];
    enter.append("path");
    update.attr("stroke-width", 1)
        .attr("stroke", "#FFFFFF")
        .attr("d", path)
        .attr("fill", function(d) {

            if (d.properties.SOVEREIGNT == "China") {
                return "#0088FF";
            } else {
                c.push(d.properties.SOVEREIGNT);
                return "none";
            }
        });

    var canvas = document.createElement('canvas')
    canvg(canvas, svg[0][0].outerHTML);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    material.opacity = 0.5;

    threeScene.globe.addNewLayer(material, 0.005);

    var int = self.setInterval(
        function() {
            var names = [];
            var l = Math.min(c.length,10) * Math.random();
            for (var i = 0; i < l; i++) {
                names.push(c.shift());
            };

            update
                .filter(function(d, i) {
                    return names.indexOf(d.properties.SOVEREIGNT) >= 0;
                })
                .attr("fill", function(d, i) {
                    return d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255);
                });
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            canvg(canvas, svg[0][0].outerHTML);
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            material.map.dispose();
            material.map = texture;
            material.needsUpdate = true;

            if (!c.shift()) {
                window.clearInterval(int);
                return;
            }
        },
        10000
    );

})(threeScene);

(function(threeScene) {
    var d3Sketch = {};
    d3.ns.prefix.custom = "custom";
    var sketchSelection = d3.select(document.createElement('body')).append("custom:sketch");
    var repertorys = sketchSelection.append("custom:repertorys");
    var citys = sketchSelection.append("custom:citys");
    var deals = sketchSelection.append("custom:deals");

    function update() {
        var update = repertorys.selectAll('repertory').data(DB.repertorys, function(d) {
            return d.name
        });
        var enter = update.enter();
        var exit = update.exit();

        enter
            .append("custom:repertory")
            .each(function(d, i) {
                threeScene.globe.addLandMark(d.name, d.log, d.lat);
                var mesh = this._mesh = threeScene.globe.getLandMark(d.name);
                mesh.scale.copy(new THREE.Vector3(0, 0, 0));
            })
            .transition()
            .duration(2000)
            .attrTween('A', function(d, i) {
                var mesh = this._mesh;
                var interpolate = d3.interpolate(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
                return function tween(t) {
                    var v = interpolate(t);
                    mesh.scale.copy(v);
                };
            });
        update
            .attr('id', function(d) {
                return d.id
            })
            .attr('name', function(d) {
                return d.name
            })
            .attr('lat', function(d) {
                return d.lat
            })
            .attr('log', function(d) {
                return d.log
            });
        exit.remove();

        var update = citys.selectAll('city').data(DB.citys, function(d) {
            return d.name
        });
        var enter = update.enter();
        var exit = update.exit();

        enter
            .append("custom:city")
            .each(function(d, i) {
                threeScene.globe.addLandMark(d.name, d.log, d.lat, "#00FFFF");
                var mesh = this._mesh = threeScene.globe.getLandMark(d.name);
                mesh.scale.copy(new THREE.Vector3(0, 0, 0));
            })
            .transition()
            .delay(3000)
            .duration(1000)
            .attrTween('A', function(d, i) {
                var mesh = this._mesh;
                var interpolate = d3.interpolate(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
                return function tween(t) {
                    var v = interpolate(t);
                    mesh.scale.copy(v);
                };
            });
        update
            .attr('id', function(d) {
                return d.id
            })
            .attr('name', function(d) {
                return d.name
            })
            .attr('lat', function(d) {
                return d.lat
            })
            .attr('log', function(d) {
                return d.log
            });
        exit
            .remove();

        var update = deals.selectAll('deal').data(DB.deals, function(d) {
            return d.id
        });
        var enter = update.enter();
        var exit = update.exit();

        exit.remove()
            .transition()
            .delay(2000)
            .duration(2000)
            .attrTween('A', function(d, i) {
                return function tween(t) {
                    threeScene.globe.setLinePisappear(d.r, d.c, t);
                };
            });
        enter.append("custom:deal")
            .each(function(d) {
                var color = 0x44FF44;
                if (d.r == "北京") {
                    color = 0x4488ff;
                }
                if (d.r == "上海") {
                    color = 0xff8844;
                }
                threeScene.globe.addLine(d.r, d.c, null, color);
            })
            .transition()
            .delay(2000)
            .duration(2000)
            .attrTween('A', function(d, i) {
                return function tween(t) {
                    threeScene.globe.setLineProgress(d.r, d.c, t);
                };
            });
        update
            .attr('id', function(d) {
                return d.id
            })
            .attr('r', function(d) {
                return d.r
            })
            .attr('c', function(d) {
                return d.c
            });
    }
    update();

    var index = 0;
    var i = 8;

    function clock() {
        i++;
        index++;
        if (index > 8) { index = 0 };
        var newCity = DB.altCity.shift();
        //console.log(newCity);

        if (!newCity) {
            window.clearInterval(int);
            console.log("END");
            return;
        }
        var newDeal = { id: 'd' + i, r: '北京', c: newCity.name }

        if (index == 1 || index == 2) {
            newDeal = { id: 'd' + i, r: '广州', c: newCity.name }
        }

        if (index == 3 || index == 4 || index == 5 || index == 6) {
            newDeal = { id: 'd' + i, r: '上海', c: newCity.name }
        }
        DB.deals.push(newDeal);
        DB.citys.push(newCity);
        // if (DB.deals.length > 30) {
        //     DB.deals.shift();
        //     DB.citys.shift();
        // };
        update();
    }

    function clock10() {
        clock();
    }
    var int = window.setInterval(clock10,
        333);

    d3Sketch.sketchSelection = sketchSelection;
    d3Sketch.update = update;
    return d3Sketch;
})(threeScene);
