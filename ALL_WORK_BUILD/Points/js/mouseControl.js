var MouseControl = (function () {
	var MouseControl = {};

	var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
	var rotation = { x: 1.9, y: 0.55 }, target = { x: 1.9, y: 0.55 }, targetOnDown = { x: 0, y: 0 };
	var distance = 300, distanceTarget = 750;
	var PI_HALF = Math.PI / 2;

	function onDocumentMouseDown(event) {

	    event.preventDefault();

	    document.addEventListener('mousemove', onDocumentMouseMove, false);
	    document.addEventListener('mouseup', onDocumentMouseUp, false);
	    document.addEventListener('mouseout', onDocumentMouseOut, false);

	    mouseOnDown.x = -event.clientX;
	    mouseOnDown.y = event.clientY;

	    targetOnDown.x = target.x;
	    targetOnDown.y = target.y;

	    container.style.cursor = 'move';

	}

	function onDocumentMouseMove(event) {

	    mouse.x = -event.clientX;
	    mouse.y = event.clientY;

	    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005;
	    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005;

	    target.y = target.y > PI_HALF ? PI_HALF : target.y;
	    target.y = target.y < -PI_HALF ? -PI_HALF : target.y;

	}

	function onDocumentMouseUp(event) {

	    document.removeEventListener('mousemove', onDocumentMouseMove, false);
	    document.removeEventListener('mouseup', onDocumentMouseUp, false);
	    document.removeEventListener('mouseout', onDocumentMouseOut, false);

	    container.style.cursor = 'auto';

	}

	function onDocumentMouseOut(event) {

	    document.removeEventListener('mousemove', onDocumentMouseMove, false);
	    document.removeEventListener('mouseup', onDocumentMouseUp, false);
	    document.removeEventListener('mouseout', onDocumentMouseOut, false);

	}

	function onDocumentMouseWheel(event) {
	    distanceTarget -= event.wheelDeltaY * 0.3;
	    distanceTarget = distanceTarget > 900 ? 900 : distanceTarget;
	    distanceTarget = distanceTarget < 150 ? 150 : distanceTarget;
	}

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mousewheel', onDocumentMouseWheel, false);

	MouseControl.updateCamera =function(camera){
		rotation.x += ( target.x - rotation.x ) * 0.05;
		rotation.y += ( target.y - rotation.y ) * 0.05;
		distance += ( distanceTarget - distance ) * 0.05;

		camera.position.x = distance * Math.sin( rotation.x ) * Math.cos( rotation.y );
		camera.position.y = distance * Math.sin( rotation.y );
		camera.position.z = distance * Math.cos( rotation.x ) * Math.cos( rotation.y );
		camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
		return distance;
	};
	return MouseControl;
})();