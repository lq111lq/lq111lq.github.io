define(['threescene/Globe'], function(Globe) {
    function GlobalScene(container) {
        var width = container.clientWidth;
        var height = container.clientHeight;

        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0xFFFFFF, 0);
        container.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x269BF7, 0.0005);

        var camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 300000);
        scene.add(camera);

        directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 800, -100);
        scene.add(directionalLight);

        var ambiColor = "#aaaabb";
        var ambientLight = new THREE.AmbientLight(ambiColor);
        scene.add(ambientLight);

        var globe = new Globe();
        scene.add(globe);
        directionalLight.target = globe;

        camera.position.z = 800;
        globe.position.y = -15;

        function render() {
            TWEEN.update();
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }
        render();

        this.showHourlyNews = function(hn) {
            globe.showHourlyNews(hn);
        }
    }
    return GlobalScene;
})
