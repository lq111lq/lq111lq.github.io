var LightCreator = (function () {
	var LightCreator = {};

	function creat(target, gui){
		var group = new THREE.Group();
		var directionalLight = new THREE.DirectionalLight("#FFFFFF");
		directionalLight.position.set(0, 0, -1000);

		directionalLight.castShadow = false;
		directionalLight.shadowCameraNear = 2;
		directionalLight.shadowCameraFar = 1000;
		directionalLight.shadowCameraLeft = -1000;
		directionalLight.shadowCameraRight = 1000;
		directionalLight.shadowCameraTop = 100;
		directionalLight.shadowCameraBottom = -100;
		directionalLight.distance = 0;
		directionalLight.intensity = 2.5;
		directionalLight.shadowMapHeight = 0;
		directionalLight.shadowMapWidth = 0;
		directionalLight.target = target;

		group.add(directionalLight);

		var ambiColor = "#232323";
        var ambientLight = new THREE.AmbientLight(ambiColor);
        group.add(ambientLight);

		// var hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 1);
		// hemiLight.position.set(0, 0, 0);
		// group.add(hemiLight);
		return group;
	}

	LightCreator.creat = creat;
	return LightCreator;
})();