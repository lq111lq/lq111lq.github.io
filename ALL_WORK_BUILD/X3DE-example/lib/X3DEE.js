(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.X3DEE = factory();
    }
}(this, function () {
var require, define;
(function () {
    var mods = {};

    define = function (id, deps, factory) {
        // In case like
        // define('echarts/model/globalDefault', {...});
        if (arguments.length === 2) {
            factory = deps;
            deps = [];
            if (typeof factory !== 'function') {
                var configObj = factory;
                factory = function () { return configObj; };
            }
        }
        mods[id] = {
            id: id,
            deps: deps,
            factory: factory,
            defined: 0,
            exports: {},
            require: createRequire(id)
        };
    };

    require = createRequire('');

    function normalize(id, baseId) {
        if (!baseId) {
            return id;
        }

        if (id.indexOf('.') === 0) {
            var basePath = baseId.split('/');
            var namePath = id.split('/');
            var baseLen = basePath.length - 1;
            var nameLen = namePath.length;
            var cutBaseTerms = 0;
            var cutNameTerms = 0;

            pathLoop: for (var i = 0; i < nameLen; i++) {
                switch (namePath[i]) {
                    case '..':
                        if (cutBaseTerms < baseLen) {
                            cutBaseTerms++;
                            cutNameTerms++;
                        }
                        else {
                            break pathLoop;
                        }
                        break;
                    case '.':
                        cutNameTerms++;
                        break;
                    default:
                        break pathLoop;
                }
            }

            basePath.length = baseLen - cutBaseTerms;
            namePath = namePath.slice(cutNameTerms);

            return basePath.concat(namePath).join('/');
        }

        return id;
    }

    function createRequire(baseId) {
        var cacheMods = {};

        function localRequire(id, callback) {
            if (typeof id === 'string') {
                var exports = cacheMods[id];
                if (!exports) {
                    exports = getModExports(normalize(id, baseId));
                    cacheMods[id] = exports;
                }

                return exports;
            }
            else if (id instanceof Array) {
                callback = callback || function () {};
                callback.apply(this, getModsExports(id, callback, baseId));
            }
        };

        return localRequire;
    }

    function getModsExports(ids, factory, baseId) {
        var es = [];
        var mod = mods[baseId];

        for (var i = 0, l = Math.min(ids.length, factory.length); i < l; i++) {
            var id = normalize(ids[i], baseId);
            var arg;
            switch (id) {
                case 'require':
                    arg = (mod && mod.require) || require;
                    break;
                case 'exports':
                    arg = mod.exports;
                    break;
                case 'module':
                    arg = mod;
                    break;
                default:
                    arg = getModExports(id);
            }
            es.push(arg);
        }

        return es;
    }

    function getModExports(id) {
        var mod = mods[id];
        if (!mod) {
            throw new Error('No ' + id);
        }

        if (!mod.defined) {
            var factory = mod.factory;
            var factoryReturn = factory.apply(
                this,
                getModsExports(mod.deps || [], factory, id)
            );
            if (typeof factoryReturn !== 'undefined') {
                mod.exports = factoryReturn;
            }
            mod.defined = 1;
        }

        return mod.exports;
    }
}());

define('core/materials',['require'],function(require) {
	var materialCreaters = {};

	function registerMaterialCreater(name, materialCreater) {
		materialCreaters[name] = materialCreater;
	}

	function getMaterial(name) {
		var materialCreater = materialCreaters[name];
		if(materialCreater) {
			return materialCreater();
		} else {
			return new THREE.MeshBasicMaterial({
				color: 0x00ff00
			});
		}
	}

	registerMaterialCreater('BasicPhongMaterial', function() {
		var material = new THREE.MeshPhongMaterial({
			color: new THREE.Color(0xffffff),
			shading: THREE.SmoothShading
		});

		var diffuseColor = new THREE.Color();
		diffuseColor.setHSL(0, 0, 0.7);
		diffuseColor.multiplyScalar(1);

		var specularColor = new THREE.Color();
		specularColor.copy(diffuseColor);
		specularColor.multiplyScalar(0.15);
		material.specular.copy(specularColor);
		material.shininess = 40;

		return material
	});
	return {
		registerMaterialCreater: registerMaterialCreater,
		getMaterial: getMaterial
	}
});
define('core/x-scene',['require'],function(require) {
	var xScenePrototype = Object.create(HTMLElement.prototype);
	xScenePrototype.createdCallback = createdCallback;
	xScenePrototype.attributeChangedCallback = attributeChangedCallback;
	xScenePrototype.updateCamera = updateCamera;

	xScenePrototype.getSceneInfo = function() {
		var $this = $(this);
		var width = $this.width();
		var height = $this.height();
		return {
			scene: this.object3D,
			renderer: this.renderer,
			camera: this.camera,
			width: width,
			height: height
		};
	}

	function createdCallback() {
		var self = this;

		var $this = $(this);
		var width = $this.width();
		var height = $this.height();

		var renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.shadowMap.enabled = true;
		renderer.setSize(width, height);
		renderer.setPixelRatio(window.devicePixelRatio);

		this.appendChild(renderer.domElement);

		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);

		scene.fog = new THREE.Fog(0x050505, 1, 5000);
		scene.fog.color.copy(new THREE.Color(0xffffff));

		var controls = new THREE.TrackballControls(camera, self);
		controls.minDistance = 10.0;
		controls.maxDistance = 1500.0;
		controls.dynamicDampingFactor = 0.1;

		camera.position.z = 10;
		this.camera = camera;

		this.updateCamera();

		var lastIntersectObjectsMap = {};
		var intersectObjectsMap = {};

		var raycaster = new THREE.Raycaster();

		var render = function() {
			if(self.getAttribute('stop') === "true") {

			} else {
				controls.update();
				if(camera.position.y < 10) {
					camera.position.y = 10;
				}
				var allVisibleObjects = [];

				scene.traverseVisible(function(object) {
					allVisibleObjects.push(object);
				});

				allVisibleObjects.forEach(function(visibleObject) {
					if(visibleObject.element && visibleObject.element.executeRenderTasks) {
						visibleObject.element.executeRenderTasks();
					}
				});

				renderer.render(scene, camera);
			}

			requestAnimationFrame(render);
		};

		render();

		this.addEventListener('mousemove', onMouseMove, false);
		this.addEventListener('click', onClick, false);
		window.addEventListener('resize', onWindowResize, false);
		
		var lastIntersectObjectsMap;
		function onMouseMove(event) {
			event.preventDefault();

			var mouse = new THREE.Vector2();

			mouse.x = (event.clientX / width) * 2 - 1;
			mouse.y = -(event.clientY / height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);

			var allVisibleObjects = [];

			scene.traverseVisible(function(object) {
				allVisibleObjects.push(object);
			});

			var intersectObjectsMap = {};
			var intersects = raycaster.intersectObjects(allVisibleObjects,true);
			intersects.forEach(function(intersect) {
				intersectObjectsMap[intersect.object.id] = intersect.object;
			});

			for(var id in intersectObjectsMap) {
				var el = intersectObjectsMap[id].element;
				if(lastIntersectObjectsMap[id]) {
					$(el).triggerHandler('mousemove');
				} else {
					$(el).triggerHandler('mouseenter');
					//$(el).triggerHandler('mouseover');
				}
			}

			for(var id in lastIntersectObjectsMap) {
				var el = lastIntersectObjectsMap[id].element;
				if(!intersectObjectsMap[id]) {
					//$(el).triggerHandler('mouseout');
					$(el).triggerHandler('mouseleave');
				}
			}

			lastIntersectObjectsMap = intersectObjectsMap
		}

		function onClick(event) {
			event.preventDefault();

			var mouse = new THREE.Vector2();

			mouse.x = (event.clientX / width) * 2 - 1;
			mouse.y = -(event.clientY / height) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);

			var allVisibleObjects = [];

			scene.traverseVisible(function(object) {
				allVisibleObjects.push(object);
			});
			
			var intersects = raycaster.intersectObjects(allVisibleObjects,true);
			
			intersects.forEach(function(intersect) {
				$(intersect.object.element).triggerHandler('click');
			});
		}

		function onWindowResize() {

			width = $this.width();
			height = $this.height();

			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize(width, height);

		}
		this.object3D = scene;
		this.renderer = renderer;
		this.camera = camera;
	};

	function attributeChangedCallback() {
		this.updateCamera();
	}

	function updateCamera() {
		var positionStrArry = this.getAttribute('cameraposition');

		if(!/^-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/.test(positionStrArry)) {
			positionStrArry = '0 0 10'
		}

		positionStrArry = positionStrArry.split(/\s+/);
		var position = [this.camera.position.x, this.camera.position.y, this.camera.position.z];

		positionStrArry.forEach(function(d, i) {
			if(isNaN(d) || d === '') {
				return;
			}
			position[i] = Number(d);
		});

		this.camera.position.set(position[0], position[1], position[2]);

		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	var xScene = document.registerElement('x-scene', {
		prototype: xScenePrototype
	});

	return xScene;
});
define('core/nodePrototype',['require'],function(require) {
	var nodePrototype = Object.create(HTMLElement.prototype);

	nodePrototype.registerRenderTasks = registerRenderTasks;
	nodePrototype.deleteRenderTasks = deleteRenderTasks;
	nodePrototype.executeRenderTasks = executeRenderTasks;
	nodePrototype.setRenderTaskNeedExecute = setRenderTaskNeedExecute;

	nodePrototype.registerAttribute = registerAttribute;
	nodePrototype.getAttributeValue = getAttributeValue;

	nodePrototype.createdCallback = createdCallback;
	nodePrototype.attachedCallback = attachedCallback;
	nodePrototype.detachedCallback = detachedCallback;
	nodePrototype.attributeChangedCallback = attributeChangedCallback;

	nodePrototype.init = init;

	nodePrototype.getSceneInfo = function() {
		if(this.parentElement) {
			return this.parentElement.getSceneInfo();
		}
		return null;
	}

	function registerRenderTasks(name, taskFn, needExecute, forever) {
		this.renderTasks[name] = {
			name: name,
			needExecute: needExecute || false,
			forever: forever || false,
			taskFn: taskFn || function() {},
		};
	}
	function deleteRenderTasks(name) {
		delete this.renderTasks[name];
	}
	function executeRenderTasks() {
		for(var name in this.renderTasks) {
			var renderTask = this.renderTasks[name];
			if(renderTask && (renderTask.needExecute || renderTask.forever)) {
				renderTask.taskFn.call(this);
				renderTask.needExecute = false;
			}
		}
	}

	function setRenderTaskNeedExecute(name) {
		var renderTask = this.renderTasks[name];
		if(renderTask) {
			renderTask.needExecute = true
		};
	}

	function registerAttribute(name, defValue, verifyRegExp, changeHandle) {
		this.attributeInfos[name] = {
			name: name,
			defValue: defValue,
			verifyRegExp: verifyRegExp,
			changeHandle: changeHandle,
		};
	}

	function getAttributeValue(name) {
		var value = this.getAttribute(name);
		if(this.attributeInfos[name]) {
			if(value !== '' && this.attributeInfos[name].verifyRegExp.test(value)) {
				return value;
			} else {
				return this.attributeInfos[name].defValue;
			}
		} else {
			return value;
		}
	}

	function createdCallback() {
		var self = this;

		if(!this.attributeInfos) {
			this.attributeInfos = {};
		}
		if(!this.renderTasks) {
			this.renderTasks = {};
		}

		this.registerAttribute('position', '0 0 0', /^-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('positionRenderTask');
		});
		this.registerAttribute('rotation', '0 0 0', /^-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('rotationRenderTask');
		});
		this.registerAttribute('scale', '1 1 1', /^-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('scaleRenderTask');
		});
		this.registerAttribute('shadow', 'false', /^(true|false)$/, function() {
			self.setRenderTaskNeedExecute('updateShadow');
		});
		this.registerRenderTasks('positionRenderTask', positionRenderTask, true);
		this.registerRenderTasks('rotationRenderTask', rotationRenderTask, true);
		this.registerRenderTasks('scaleRenderTask', scaleRenderTask, true);
		this.registerRenderTasks('updateShadow', updateShadow, true);

		this.init();
	};

	function init() {
		var self = this;
		if(this.inited) {
			return;
		}
		this.inited = true;

		this.object3D = this.creatObject3D();
		this.object3D.element = this

		if(this.advanceObject3DChildern) {
			this.advanceObject3DChildern.forEach(function(object3D) {
				self.object3D && self.object3D.add(object3D);
			});
		}

		$(this).children().each(function() {
			this.createdCallback && this.createdCallback();
		});

		this.setRenderTaskNeedExecute('positionRenderTask');
		this.setRenderTaskNeedExecute('rotationRenderTask');
		this.setRenderTaskNeedExecute('scaleRenderTask');
	}

	function attachedCallback() {
		if(!this.inited) {
			this.init();
			this.inited = true;
		}
		this.lastParentNode = this.parentNode;
		if(this.parentNode && this.parentNode.object3D) {
			this.parentNode.object3D.add(this.object3D);
		} else if(this.parentNode && !this.parentNode.object3D) {
			if(!this.parentNode.advanceObject3DChildern) {
				this.parentNode.advanceObject3DChildern = [];
			}
			this.parentNode.advanceObject3DChildern.push(this.object3D);
		}
	};

	function detachedCallback() {
		if(this.lastParentNode && this.lastParentNode.object3D) {
			this.lastParentNode.object3D.remove(this.object3D);
		}

		$(this).children().each(function() {
			this.detachedCallback && this.detachedCallback();
		});

		this.dispose();
		this.inited = false;
	}

	function attributeChangedCallback(attrName, oldVal, newVal) {
		if(oldVal !== newVal) {
			var attributeInfo = this.attributeInfos[attrName];
			attributeInfo && attributeInfo.changeHandle && attributeInfo.changeHandle.call(this);
		};
	};

	function positionRenderTask() {
		var positionStrArry = this.getAttributeValue('position').split(/\s+/);
		var position = [this.object3D.position.x, this.object3D.position.y, this.object3D.position.z];

		positionStrArry.forEach(function(d, i) {
			if(isNaN(d) || d === '') {
				return;
			}
			position[i] = Number(d);
		});

		this.object3D.position.set(position[0], position[1], position[2]);
	}

	function rotationRenderTask() {
		var rotation = [this.object3D.rotation.x, this.object3D.rotation.y, this.object3D.rotation.z];
		var rotationStrArry = this.getAttributeValue('rotation').split(/\s+/);

		rotationStrArry.forEach(function(d, i) {
			if(isNaN(d) || d === '') {
				return;
			}
			rotation[i] = Math.PI * (Number(d) / 180);
		});

		this.object3D.rotation.set(rotation[0], rotation[1], rotation[2]);
	}

	function scaleRenderTask() {
		var scale = [this.object3D.scale.x, this.object3D.scale.y, this.object3D.scale.z];
		var scaleStrArry = this.getAttributeValue('scale').split(/\s+/);

		scaleStrArry.forEach(function(d, i) {
			if(isNaN(d) || d === '') {
				return;
			}
			scale[i] = Number(d);
		});

		this.object3D.scale.set(scale[0], scale[1], scale[2]);
	}
	
	function updateShadow() {
		var flag = this.getAttributeValue('shadow');
		if(!this.object3D){
			return;	
		}
		
		if(flag === 'true'){
			this.object3D.castShadow = true;
			this.object3D.receiveShadow = true;
		}else {
			this.object3D.castShadow = false;
			this.object3D.receiveShadow = false;
		}

	}
	
	return nodePrototype;
});
define('core/x-group',['require','./nodePrototype'],function(require) {
	var nodePrototype = require('./nodePrototype');
	
	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	
	function creatObject3D() {
		return new THREE.Group();
	};
	
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
		}
	}
	
	var xGroup = document.registerElement('x-group', {
		prototype: prototype
	});
	
	return xGroup;
});
define('core/x-cube',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');
	
	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	
	function creatObject3D() {
		var self = this;
		
		this.registerRenderTasks('changeMaterial',changeMaterial,true);
		this.registerRenderTasks('updateColorTask',updateColorTask,true);

		this.registerAttribute('color', '#00FF00', /^#[0-9a-fA-F]{6}$/, function() {
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		
		this.registerAttribute('material', '', /^[\s\S]*$/, function() {
			self.setRenderTaskNeedExecute('changeMaterial');
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = materials.getMaterial();
		
		return new THREE.Mesh(geometry, material);
	};
	
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.geometry.dispose();
			this.object3D.material.dispose();
		}
	}
	
	function updateColorTask() {
		var color = this.getAttributeValue('color');
		this.object3D.material.color = new THREE.Color(color);
		this.object3D.material.needsUpdate = true;
	}
	
	function changeMaterial() {
		if(this.object3D) {
			this.object3D.material.dispose();
			this.object3D.material = materials.getMaterial(this.getAttributeValue('material'));
			this.object3D.material.needsUpdate = true;
		}
	}
	
	var xCube = document.registerElement('x-cube', {
		prototype: prototype
	});
	
	return xCube;
});
define('core/x-plane',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	
	function creatObject3D() {
		var self = this;
		
		this.registerRenderTasks('updateTask',updateTask,true);
		this.registerRenderTasks('changeMaterial',changeMaterial,true);
		this.registerRenderTasks('updateColorTask',updateColorTask,true);
		
		this.registerAttribute('width', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});
		this.registerAttribute('height', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});
		
		this.registerAttribute('material', '', /^[\s\S]*$/, function() {
			self.setRenderTaskNeedExecute('changeMaterial');
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		
		var geometry = new THREE.PlaneBufferGeometry(1,1);
		var material = materials.getMaterial();
		
		var trianglesCount = 2;
		
		var mesh = new THREE.Mesh(geometry, material);
		mesh.renderOrder = 100;
		
		return mesh;
	};
	
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.geometry.dispose();
			this.object3D.material.dispose();
		}
	}
	
	function updateTask() {
		var geometry = this.object3D.geometry;

		var position = geometry.attributes.position.array;

		var x = Number(this.getAttributeValue('width')) / 2;
		var y = Number(this.getAttributeValue('height')) / 2;

		position[0] = -x;
		position[1] = y;
		position[2] = 0;

		position[3] = x;
		position[4] = y;
		position[5] = 0;

		position[6] = -x;
		position[7] = -y;
		position[8] = 0;
		
		position[9] = x;
		position[10] = -y;
		position[11] = 0;

		geometry.attributes.position.needsUpdate = true;
	}
	
	function changeMaterial() {
		if(this.object3D) {
			this.object3D.material.dispose();
			this.object3D.material = materials.getMaterial(this.getAttributeValue('material'));
			this.object3D.material.needsUpdate = true;
		}
	}
	
	function updateColorTask() {
		var color = this.getAttributeValue('color');
		this.object3D.material.color = new THREE.Color(color);
		this.object3D.material.needsUpdate = true;
	}
	
	var xGround = document.registerElement('x-plane', {
		prototype: prototype
	});

	return xGround;
});
define('core/x-canvas-plane',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;

	prototype.getContext = function(contextID) {
		if(this.canvas) {
			return this.canvas.getContext(contextID);
		}
	}
	prototype.update = function() {
		this.setRenderTaskNeedExecute('updateTextureTask');
	}
	prototype.clear = function() {
		var width = Number(this.getAttributeValue('width'));
		var height = Number(this.getAttributeValue('height'));

		var ctx = this.getContext('2d');
		ctx.clearRect(0, 0, width, height);

		this.setRenderTaskNeedExecute('updateTextureTask');
	}

	function creatObject3D() {
		var self = this;

		this.registerRenderTasks('updateTask', updateTask, true);
		this.registerRenderTasks('updateTextureTask', updateTextureTask, false);

		this.registerAttribute('width', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
			this.setRenderTaskNeedExecute('updateTextureTask');
			if(this.canvas) {
				var width = Number(this.getAttributeValue('width'));
				var height = Number(this.getAttributeValue('height'));

				this.canvas.width = width;
				this.canvas.height = height;
			}
		});
		this.registerAttribute('height', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
			this.setRenderTaskNeedExecute('updateTextureTask');
			if(this.canvas) {
				var width = Number(this.getAttributeValue('width'));
				var height = Number(this.getAttributeValue('height'));

				this.canvas.width = width;
				this.canvas.height = height;
			}
		});

		if(!this.canvas) {
			var width = Number(this.getAttributeValue('width'));
			var height = Number(this.getAttributeValue('height'));

			this.canvas = document.createElement('canvas');
			this.canvas.width = width;
			this.canvas.height = height;
		}

		var geometry = new THREE.PlaneBufferGeometry(1, 1);

		var material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 1,
			alphaTest: 0.1,
			depthTest: true,
			depthWrite: true,
			//wireframe:true
			//blending:THREE.NoBlending,
			//side: THREE.DoubleSide
		});
		material.map = new THREE.Texture();
		material.map.image = this.canvas;
		material.map.needsUpdate = true;
		
		var mesh = new THREE.Mesh(geometry, material);
		
		mesh.renderOrder = 999;
		
		return mesh;
	};

	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.geometry.dispose();
			this.object3D.material.map.dispose();
			this.object3D.material.dispose();
		}
	}

	function updateTask() {
		var geometry = this.object3D.geometry;

		var position = geometry.attributes.position.array;

		var width = Number(this.getAttributeValue('width'));
		var height = Number(this.getAttributeValue('height'));

		var imgData = this.canvas.getContext("2d").getImageData(0, 0, width, height);
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.getContext("2d").putImageData(imgData, 0, 0);

		var x = Number(this.getAttributeValue('width')) / 2;
		var y = Number(this.getAttributeValue('height')) / 2;

		position[0] = -x;
		position[1] = y;
		position[2] = 0;

		position[3] = x;
		position[4] = y;
		position[5] = 0;

		position[6] = -x;
		position[7] = -y;
		position[8] = 0;

		position[9] = x;
		position[10] = -y;
		position[11] = 0;

		geometry.attributes.position.needsUpdate = true;
	}

	function updateTextureTask() {
		this.object3D.material.map.dispose();
		this.object3D.material.map = new THREE.Texture();
		this.object3D.material.map.image = this.canvas;
		this.object3D.material.map.needsUpdate = true;
		this.object3D.material.needsUpdate = true;
	}

	var xGround = document.registerElement('x-canvas-plane', {
		prototype: prototype
	});

	return xGround;
});
define('core/x-canvas-sprite',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	
	prototype.getContext = function(contextID) {
		if(this.canvas) {
			return this.canvas.getContext(contextID);
		}
	}
	prototype.update = function() {
		this.setRenderTaskNeedExecute('updateTextureTask');
	}
	prototype.clear = function() {
		var width = Number(this.getAttributeValue('width'));
		var height = Number(this.getAttributeValue('height'));
		
		var ctx = this.getContext('2d');
		ctx.clearRect(0,0,width,height);
		
		this.setRenderTaskNeedExecute('updateTextureTask');
	}

	function creatObject3D() {
		var self = this;
		
		this.deleteRenderTasks('scaleRenderTask');
		this.registerRenderTasks('updateTextureTask', updateTextureTask, false);
		this.registerRenderTasks('updateScaleTask', updateScaleTask, true);
		
		this.registerAttribute('width', '0', /^\d+(\.\d+)?$/, function() {
			this.setRenderTaskNeedExecute('updateScaleTask');
			this.setRenderTaskNeedExecute('updateTextureTask');
			if(this.canvas) {
				var width = Number(this.getAttributeValue('width'));
				var height = Number(this.getAttributeValue('height'));

				this.canvas.width = width;
				this.canvas.height = height;
			}
		});
		this.registerAttribute('height', '0', /^\d+(\.\d+)?$/, function() {
			this.setRenderTaskNeedExecute('updateScaleTask');
			this.setRenderTaskNeedExecute('updateTextureTask');
			if(this.canvas) {
				var width = Number(this.getAttributeValue('width'));
				var height = Number(this.getAttributeValue('height'));

				this.canvas.width = width;
				this.canvas.height = height;
			}
		});
		this.registerAttribute('scale', '1 1 1', /^-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/, function() {
			this.setRenderTaskNeedExecute('updateScaleTask');
		});
		
		if(!this.canvas) {
			var width = Number(this.getAttributeValue('width'));
			var height = Number(this.getAttributeValue('height'));

			this.canvas = document.createElement('canvas');
			this.canvas.width = width;
			this.canvas.height = height;
		}

		var material = new THREE.SpriteMaterial({
			transparent: true,
			opacity: 1,
			alphaTest: 0.05
		});
		
		material.map = new THREE.Texture();
		material.map.image = this.canvas;
		material.map.needsUpdate = true;

		return new THREE.Sprite(material);
	};
	
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.geometry.dispose();
			this.object3D.material.map.dispose();
			this.object3D.material.dispose();
		}
	}

	function updateTextureTask() {
		this.object3D.material.map.dispose();
		this.object3D.material.map = new THREE.Texture();
		this.object3D.material.map.image = this.canvas;
		this.object3D.material.map.needsUpdate = true;
		this.object3D.material.needsUpdate = true;
	}
	
	function updateScaleTask() {
		var width = Number(this.getAttributeValue('width'));
		var height = Number(this.getAttributeValue('height'));
		
		var imgData = this.canvas.getContext("2d").getImageData(0,0,width,height);
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.getContext("2d").putImageData(imgData,0,0);
		
		var scale = [1,1,1];
		var scaleStrArry = this.getAttributeValue('scale').split(/\s+/);

		scaleStrArry.forEach(function(d, i) {
			if(isNaN(d) || d === '') {
				return;
			}
			scale[i] = Number(d);
		});
		
		this.object3D.scale.set(scale[0] * width, scale[1] * height, scale[2]);
	}
	
	var xCanvasSrite = document.registerElement('x-canvas-sprite', {
		prototype: prototype
	});

	return xCanvasSrite;
});
define('core/x-line',['require','./nodePrototype'],function(require) {
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;

	function creatObject3D() {
		var self = this;
		this.registerRenderTasks('setPointsPositionsAndColors', setPointsPositionsAndColors, true);

		this.registerAttribute('points', '0 0 0', /^(-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s+)*-?\d+(\.\d+)?\s-?\d+(\.\d+)?\s-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('setPointsPositionsAndColors');
		});

		this.registerAttribute('color', '#00FF00', /^(#[0-9a-fA-F]{6}\s+)*(#[0-9a-fA-F]{6})$/, function() {
			self.setRenderTaskNeedExecute('setPointsPositionsAndColors');
		});

		var geometry = new THREE.BufferGeometry();
		var material = new THREE.LineBasicMaterial({
			vertexColors: THREE.VertexColors
		});

		var positions = new Float32Array(0);
		var colors = new Float32Array(0);

		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

		geometry.computeBoundingSphere();

		return mesh = new THREE.Line(geometry, material);
	};

	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
		}
	}

	function setPointsPositionsAndColors() {
		var geometry = this.object3D.geometry;
		
		var positions = geometry.attributes.position.array;
		var colors = geometry.attributes.color.array;
		
		var points = [];
		var coordinatesStrArry = this.getAttributeValue('points').split(/\s+/);
		for(var i = 0; i < coordinatesStrArry.length; i += 3) {
			points.push({
				x: coordinatesStrArry[i + 0],
				y: coordinatesStrArry[i + 1],
				z: coordinatesStrArry[i + 2]
			});
		}

		var pointColors = [];
		var pointColorsStrArry = this.getAttributeValue('color').split(/\s+/);
		for(var i = 0; i < pointColorsStrArry.length; i++) {
			pointColors.push(new THREE.Color(pointColorsStrArry[i]));
		}
		
		if(points.length * 3 >positions.length) {
			var positions = new Float32Array(points.length*3);
			var colors = new Float32Array(points.length*3);
			
			geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
			geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
		}
		
		points.forEach(function(point, i) {

			positions[i * 3] = point.x;
			positions[i * 3 + 1] = point.y;
			positions[i * 3 + 2] = point.z;

			var color = new THREE.Color('#FF0000');
			if(pointColors.length) {
				if(i < pointColors.length) {
					color = pointColors[i]
				} else {
					color = pointColors[pointColors.length - 1]
				}
			}

			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;

		});
		
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.color.needsUpdate = true;
		
		geometry.computeBoundingSphere();
		geometry.needsUpdate = true;
		
		this.object3D.geometry = geometry;
	}

	var xLine = document.registerElement('x-line', {
		prototype: prototype
	});

	return xLine;
});
define('core/x-globe',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	prototype.setMapImage = function(image){
		var texture = this.object3D.getObjectByName('earth').material.uniforms['texture'].value;
		texture && texture.dispose && texture.dispose();
		
		this.object3D.getObjectByName('earth').material.uniforms['texture'].value = new THREE.Texture();
		this.object3D.getObjectByName('earth').material.uniforms['texture'].value.image = image;
		this.object3D.getObjectByName('earth').material.uniforms['texture'].value.needsUpdate = true;
	};
	
	var Shaders = {
		'earth': {
			uniforms: {
				'texture': {
					type: 't',
					value: null
				}
			},
			vertexShader: [
				'varying vec3 vNormal;',
				'varying vec2 vUv;',
				'void main() {',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'vNormal = normalize( normalMatrix * normal );',
				'vUv = uv;',
				'}'
			].join('\n'),
			fragmentShader: [
				'uniform sampler2D texture;',
				'varying vec3 vNormal;',
				'varying vec2 vUv;',
				'void main() {',
				'vec3 diffuse = texture2D( texture, vUv ).xyz;',
				'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
				'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
				'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
				'}'
			].join('\n')
		},
		'atmosphere': {
			uniforms: {},
			vertexShader: [
				'varying vec3 vNormal;',
				'void main() {',
				'vNormal = normalize( normalMatrix * normal );',
				'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
				'}'
			].join('\n'),
			fragmentShader: [
				'varying vec3 vNormal;',
				'void main() {',
				'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
				'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
				'}'
			].join('\n')
		}
	};

	function creatObject3D() {
		var self = this;

		this.registerAttribute('radius', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateGeometry');
		});

		this.registerAttribute('texture', '0', /^[\s\S]*$/, function() {
			self.setRenderTaskNeedExecute('updateTexture');
		});

		this.registerRenderTasks('updateGeometry', updateGeometry, true);
		this.registerRenderTasks('updateTexture', updateTexture, true);

		var geometry = new THREE.SphereBufferGeometry(0, 1, 1);

		var shader = Shaders['earth'];
		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

		var material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		});

		var earth = new THREE.Mesh(geometry, material);
		earth.name = 'earth';

		shader = Shaders['atmosphere'];
		uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		});
		
		var atmosphere = new THREE.Mesh(geometry, material);
   		atmosphere.scale.set( 1.1, 1.1, 1.1 );
    	atmosphere.name = 'atmosphere';
		
		var group = new THREE.Group();
		group.add(earth);
		group.add(atmosphere);

		return group;
	};

	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.getObjectByName('earth').geometry.dispose();
			this.object3D.getObjectByName('earth').material.dispose();
		}
	}

	function updateGeometry() {
		var radius = this.getAttributeValue('radius');

		var geometry = new THREE.SphereBufferGeometry(radius, 128, 64);

		this.object3D.getObjectByName('earth').geometry = geometry;
		this.object3D.getObjectByName('earth').needsUpdate = true;
		
		this.object3D.getObjectByName('atmosphere').geometry = geometry;
		this.object3D.getObjectByName('atmosphere').needsUpdate = true;
	}

	function updateTexture() {
		var texture = this.getAttributeValue('texture');
		this.object3D.getObjectByName('earth').material.uniforms['texture'].value = THREE.ImageUtils.loadTexture(texture);
	}

	var xGlobe = document.registerElement('x-globe', {
		prototype: prototype
	});

	return xGlobe;
});
define('core/x-skybox',['require','./nodePrototype'],function(require) {
	var nodePrototype = require('./nodePrototype');
	
	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;
	
	function creatObject3D() {
		var object3D = new THREE.Group();

		
		var topColor = new THREE.Color(0x0077ff);
		var bottomColor = new THREE.Color(0xffffff);
		var ambientColor = new THREE.Color(0x303030);
		var directionaColor = new THREE.Color(0xffffff);
		var hemiLightColor = new THREE.Color(0x3284ff);
		var hemiLightGroundColor = new THREE.Color(0xffc87f);
		var groundColor = new THREE.Color(0xffc87f);
		
		var ambientLight = new THREE.AmbientLight(0x303030);
		
		var d = 1000;
		var light = new THREE.DirectionalLight(directionaColor, 0.95);
		light.castShadow = true;
		light.shadowMapWidth = 2048*2;
		light.shadowMapHeight = 2048*2;
		light.shadowCameraLeft = -d;
		light.shadowCameraRight = d;
		light.shadowCameraTop = d;
		light.shadowCameraBottom = -d;
		light.shadowCameraFar = 3500;
		light.shadowBias = -0.0001;
		light.position.set(-750,1250,750);

		var hemiLight = new THREE.HemisphereLight(hemiLightColor, hemiLightGroundColor, 0.4);
		hemiLight.position.set(0, 250, 0);
		
		var vertexShader = 'varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }';
		var fragmentShader = 'uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main() { float h = normalize( vWorldPosition + offset ).y; gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max(h , 0.0), exponent ), 0.0 ) ), 1.0 ); }';
		var uniforms = {
			topColor: {
				type: "c",
				value: hemiLightColor
			},
			bottomColor: {
				type: "c",
				value: bottomColor
			},
			offset: {
				type: "f",
				value: 33
			},
			exponent: {
				type: "f",
				value: 0.6
			}
		};

		var skyGeo = new THREE.SphereGeometry(4000, 32, 15);
		var skyMat = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: uniforms,
			side: THREE.BackSide
		});
		
		var sky = new THREE.Mesh(skyGeo, skyMat);

//		var textureFlare0 = new THREE.TextureLoader().load("../dist/lensflare/lensflare0.png");
//      var textureFlare3 = new THREE.TextureLoader().load("../dist/lensflare/lensflare3.png");
//			
//      var flareColor = new THREE.Color(0xffaacc);
//      var lensFlare = new THREE.LensFlare(textureFlare0, 350, 0.0, THREE.AdditiveBlending, flareColor);
//		
//      lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
//      lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
//      lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
//      lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
//
//      lensFlare.position.set(-750,1250,-750);
        
//        lensFlare.name = 'lensFlare';
        ambientLight.name = 'ambientLight';
		light.name = 'light';
		hemiLight.name = 'hemiLight';
		sky.name = 'sky';
		
        //object3D.add(lensFlare);
		object3D.add(ambientLight);
		object3D.add(light);
		object3D.add(hemiLight);
		object3D.add(sky);
		
		return object3D;
	};
	
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.getObjectByName('sky').geometry.dispose();
			this.object3D.getObjectByName('sky').material.dispose();
		}
	}
	
	var xSkyBox = document.registerElement('x-skybox', {
		prototype: prototype
	});
	
	return xSkyBox;
});
define('core/x-mirror',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;

	function creatObject3D() {
		var self = this;
		
		var sceneInfo = this.getSceneInfo();
		var renderer = sceneInfo.renderer;
		var camera = sceneInfo.camera;
		var width = sceneInfo.width;
		var height = sceneInfo.height;
		
		//console.log(sceneInfo);
		
		this.registerRenderTasks('updateTask',updateTask,true);
		this.registerRenderTasks('mirrorRender',mirrorRender,true,true);
		
		this.registerAttribute('width', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});
		this.registerAttribute('height', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});
		
		this.registerAttribute('material', '', /^[\s\S]*$/, function() {
			self.setRenderTaskNeedExecute('changeMaterial');
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		
		var groundMirror = new THREE.Mirror(renderer, camera, {
			clipBias: 0.003,
			textureWidth: width,
			textureHeight: height,
			color: 0x777777
		});
		groundMirror.name = "groundMirror";
				
		var geometry = new THREE.PlaneBufferGeometry(10, 10);
		
		var trianglesCount = 2;
		
		var position = new Float32Array(trianglesCount * 3 * 3);
		var normal = new Float32Array(trianglesCount * 3 * 3);
		
		geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
		
		var mirrorMesh = new THREE.Mesh(geometry, groundMirror.material);
		
		mirrorMesh.add(groundMirror);
		mirrorMesh.renderOrder = -1;
		
		return mirrorMesh;
	};
	
	function updateTask() {
		var geometry = this.object3D.geometry;
		
		var position = geometry.attributes.position.array;
		
		var x = Number(this.getAttributeValue('width'))/2;
		var y = Number(this.getAttributeValue('height'))/2;
		
		position[0] = -x;
		position[1] = y;
		position[2] = 0;

		position[3] = x;
		position[4] = y;
		position[5] = 0;

		position[6] = -x;
		position[7] = -y;
		position[8] = 0;
		
		position[9] = x;
		position[10] = -y;
		position[11] = 0;
		
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.normal.needsUpdate = true;
	}
	
	var xMirror = document.registerElement('x-mirror', {
		prototype: prototype
	});
	
	function mirrorRender () {
		this.object3D.getObjectByName('groundMirror').render();
	}
	
	return xMirror;
});
define('core/x-arch-column',['require','./materials','./nodePrototype'],function(require) {
	var materials = require('./materials');
	var nodePrototype = require('./nodePrototype');

	var prototype = Object.create(nodePrototype);
	prototype.creatObject3D = creatObject3D;
	prototype.dispose = dispose;

	function creatObject3D() {
		var self = this;
		
		this.registerRenderTasks('updateTask',updateTask,true);
		this.registerRenderTasks('changeMaterial',changeMaterial,true);
		this.registerRenderTasks('updateColorTask',updateColorTask,true);		
		
		
		this.registerAttribute('material', '', /^[\s\S]*$/, function() {
			self.setRenderTaskNeedExecute('changeMaterial');
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		this.registerAttribute('color', '#00FF00', /^#[0-9a-fA-F]{6}$/, function() {
			self.setRenderTaskNeedExecute('updateColorTask');
		});
		this.registerAttribute('startangle', '0', /^-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});

		this.registerAttribute('endangle', '0', /^-?\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});

		this.registerAttribute('outerradius', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});

		this.registerAttribute('innerradius', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});

		this.registerAttribute('height', '0', /^\d+(\.\d+)?$/, function() {
			self.setRenderTaskNeedExecute('updateTask');
		});
		
		var segments = 360;
		var trianglesCount = 4 + segments * 8;
		var geometry = new THREE.BufferGeometry();
		
		var position = new Float32Array(trianglesCount * 3 * 3);
		var normal = new Float32Array(trianglesCount * 3 * 3);
		
		geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
		geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
		
		var material = materials.getMaterial();
		
		return new THREE.Mesh(geometry, material);
	};
		
	function dispose() {
		if(this.object3D) {
			this.object3D.element = null;
			this.object3D.geometry.dispose();
			this.object3D.material.dispose();
		}
	}
	
	function updateTask() {
		var geometry = this.object3D.geometry;
		
		var position = geometry.attributes.position.array;
		var normal = geometry.attributes.normal.array;
		
		var startAngle = Number(this.getAttributeValue('startangle'));
		var endAngle = Number(this.getAttributeValue('endangle'));
		var outerRadius = Number(this.getAttributeValue('outerradius'));
		var innerRadius = Number(this.getAttributeValue('innerradius'));
		
		startAngle = Math.abs(startAngle)>360?startAngle%360:startAngle;
		startAngle = startAngle<0?360 + startAngle:startAngle;
		
		endAngle = Math.abs(endAngle)>360?endAngle%360:endAngle;
		endAngle = endAngle<0?360 + endAngle:endAngle;
		
		if(startAngle>endAngle){
			var a = startAngle;
			startAngle = endAngle;
			endAngle = a;
		}
		
		if(startAngle>endAngle){
			innerRadius = Number(this.getAttributeValue('outerradius'));
			outerRadius = Number(this.getAttributeValue('innerradius'));
		}
		
		if(innerRadius>outerRadius){
			innerRadius = Number(this.getAttributeValue('outerradius'));
			outerRadius = Number(this.getAttributeValue('innerradius'));
		}
		
		var height = Number(this.getAttributeValue('height'));
		var segments = 360;

		var trianglesCount = 4 + segments * 8;

		var triangleIndex = 0;
		var span = endAngle - startAngle;
		var step = span / segments;

		startAngle = Math.min(startAngle, endAngle);

		var pA = new THREE.Vector3();
		var pB = new THREE.Vector3();
		var pC = new THREE.Vector3();

		var cb = new THREE.Vector3();
		var ab = new THREE.Vector3();

		function ring(index) {
			var angle1 = -2 * Math.PI * (startAngle + index * step) / 360;
			var angle2 = -2 * Math.PI * (startAngle + index * step + step) / 360;;

			var p1 = {
				x: Math.cos(angle1) * innerRadius,
				y: Math.sin(angle1) * innerRadius,
			};
			var p2 = {
				x: Math.cos(angle2) * innerRadius,
				y: Math.sin(angle2) * innerRadius,
			};
			var p3 = {
				x: Math.cos(angle1) * outerRadius,
				y: Math.sin(angle1) * outerRadius,
			};
			var p4 = {
				x: Math.cos(angle2) * outerRadius,
				y: Math.sin(angle2) * outerRadius,
			};

			//triangles-up-1
			position[index * 8 * 3 * 3] = p1.x;
			position[index * 8 * 3 * 3 + 1] = height;
			position[index * 8 * 3 * 3 + 2] = p1.y;

			position[index * 8 * 3 * 3 + 3] = p3.x;
			position[index * 8 * 3 * 3 + 4] = height;
			position[index * 8 * 3 * 3 + 5] = p3.y;

			position[index * 8 * 3 * 3 + 6] = p2.x;
			position[index * 8 * 3 * 3 + 7] = height;
			position[index * 8 * 3 * 3 + 8] = p2.y;

			pA.set(p1.x, height, p1.y);
			pB.set(p3.x, height, p3.y);
			pC.set(p2.x, height, p2.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3] = nx;
			normal[index * 8 * 3 * 3 + 1] = ny;
			normal[index * 8 * 3 * 3 + 2] = nz;

			normal[index * 8 * 3 * 3 + 3] = nx;
			normal[index * 8 * 3 * 3 + 4] = ny;
			normal[index * 8 * 3 * 3 + 5] = nz;

			normal[index * 8 * 3 * 3 + 6] = nx;
			normal[index * 8 * 3 * 3 + 7] = ny;
			normal[index * 8 * 3 * 3 + 8] = nz;

			//triangles-up-2
			position[index * 8 * 3 * 3 + 9] = p4.x;
			position[index * 8 * 3 * 3 + 9 + 1] = height;
			position[index * 8 * 3 * 3 + 9 + 2] = p4.y;

			position[index * 8 * 3 * 3 + 9 + 3] = p2.x;
			position[index * 8 * 3 * 3 + 9 + 4] = height;
			position[index * 8 * 3 * 3 + 9 + 5] = p2.y;

			position[index * 8 * 3 * 3 + 9 + 6] = p3.x;
			position[index * 8 * 3 * 3 + 9 + 7] = height;
			position[index * 8 * 3 * 3 + 9 + 8] = p3.y;

			pA.set(p4.x, height, p4.y);
			pB.set(p2.x, height, p2.y);
			pC.set(p3.x, height, p3.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9] = nx;
			normal[index * 8 * 3 * 3 + 9 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 + 8] = nz;

			//triangles-inner-1
			position[index * 8 * 3 * 3 + 9 * 2] = p1.x;
			position[index * 8 * 3 * 3 + 9 * 2 + 1] = height;
			position[index * 8 * 3 * 3 + 9 * 2 + 2] = p1.y;

			position[index * 8 * 3 * 3 + 9 * 2 + 3] = p2.x;
			position[index * 8 * 3 * 3 + 9 * 2 + 4] = 0;
			position[index * 8 * 3 * 3 + 9 * 2 + 5] = p2.y;

			position[index * 8 * 3 * 3 + 9 * 2 + 6] = p1.x;
			position[index * 8 * 3 * 3 + 9 * 2 + 7] = 0;
			position[index * 8 * 3 * 3 + 9 * 2 + 8] = p1.y;

			pA.set(p1.x, height, p1.y);
			pB.set(p2.x, 0, p2.y);
			pC.set(p1.x, 0, p1.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 2] = nx;
			normal[index * 8 * 3 * 3 + 9 * 2 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 2 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 2 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 2 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 2 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 2 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 2 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 2 + 8] = nz;

			//triangles-inner-2
			position[index * 8 * 3 * 3 + 9 * 3] = p2.x;
			position[index * 8 * 3 * 3 + 9 * 3 + 1] = height;
			position[index * 8 * 3 * 3 + 9 * 3 + 2] = p2.y;

			position[index * 8 * 3 * 3 + 9 * 3 + 3] = p2.x;
			position[index * 8 * 3 * 3 + 9 * 3 + 4] = 0;
			position[index * 8 * 3 * 3 + 9 * 3 + 5] = p2.y;

			position[index * 8 * 3 * 3 + 9 * 3 + 6] = p1.x;
			position[index * 8 * 3 * 3 + 9 * 3 + 7] = height;
			position[index * 8 * 3 * 3 + 9 * 3 + 8] = p1.y;

			pA.set(p2.x, height, p2.y);
			pB.set(p2.x, 0, p2.y);
			pC.set(p1.x, 0, p1.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 3 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 3 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 3 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 3 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 3 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 3 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 3 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 3 + 8] = nz;

			//triangles-outer-1
			position[index * 8 * 3 * 3 + 9 * 4] = p3.x;
			position[index * 8 * 3 * 3 + 9 * 4 + 1] = height;
			position[index * 8 * 3 * 3 + 9 * 4 + 2] = p3.y;

			position[index * 8 * 3 * 3 + 9 * 4 + 3] = p3.x;
			position[index * 8 * 3 * 3 + 9 * 4 + 4] = 0;
			position[index * 8 * 3 * 3 + 9 * 4 + 5] = p3.y;

			position[index * 8 * 3 * 3 + 9 * 4 + 6] = p4.x;
			position[index * 8 * 3 * 3 + 9 * 4 + 7] = 0;
			position[index * 8 * 3 * 3 + 9 * 4 + 8] = p4.y;

			pA.set(p3.x, height, p3.y);
			pB.set(p3.x, 0, p3.y);
			pC.set(p4.x, 0, p4.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 4] = nx;
			normal[index * 8 * 3 * 3 + 9 * 4 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 4 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 4 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 4 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 4 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 4 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 4 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 4 + 8] = nz;

			//triangles-outer-2
			position[index * 8 * 3 * 3 + 9 * 5] = p4.x;
			position[index * 8 * 3 * 3 + 9 * 5 + 1] = height;
			position[index * 8 * 3 * 3 + 9 * 5 + 2] = p4.y;

			position[index * 8 * 3 * 3 + 9 * 5 + 3] = p3.x;
			position[index * 8 * 3 * 3 + 9 * 5 + 4] = height;
			position[index * 8 * 3 * 3 + 9 * 5 + 5] = p3.y;

			position[index * 8 * 3 * 3 + 9 * 5 + 6] = p4.x;
			position[index * 8 * 3 * 3 + 9 * 5 + 7] = 0;
			position[index * 8 * 3 * 3 + 9 * 5 + 8] = p4.y;

			pA.set(p4.x, height, p4.y);
			pB.set(p3.x, height, p3.y);
			pC.set(p4.x, 0, p4.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 5] = nx;
			normal[index * 8 * 3 * 3 + 9 * 5 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 5 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 5 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 5 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 5 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 5 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 5 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 5 + 8] = nz;

			//triangles-down-1
			position[index * 8 * 3 * 3 + 9 * 6] = p1.x;
			position[index * 8 * 3 * 3 + 9 * 6 + 1] = 0;
			position[index * 8 * 3 * 3 + 9 * 6 + 2] = p1.y;

			position[index * 8 * 3 * 3 + 9 * 6 + 3] = p2.x;
			position[index * 8 * 3 * 3 + 9 * 6 + 4] = 0;
			position[index * 8 * 3 * 3 + 9 * 6 + 5] = p2.y;

			position[index * 8 * 3 * 3 + 9 * 6 + 6] = p3.x;
			position[index * 8 * 3 * 3 + 9 * 6 + 7] = 0;
			position[index * 8 * 3 * 3 + 9 * 6 + 8] = p3.y;

			pA.set(p1.x, 0, p1.y);
			pB.set(p2.x, 0, p2.y);
			pC.set(p3.x, 0, p3.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 6 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 6 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 6 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 6 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 6 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 6 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 6 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 6 + 8] = nz;

			//triangles-down-2
			position[index * 8 * 3 * 3 + 9 * 7] = p4.x;
			position[index * 8 * 3 * 3 + 9 * 7 + 1] = 0;
			position[index * 8 * 3 * 3 + 9 * 7 + 2] = p4.y;

			position[index * 8 * 3 * 3 + 9 * 7 + 3] = p3.x;
			position[index * 8 * 3 * 3 + 9 * 7 + 4] = 0;
			position[index * 8 * 3 * 3 + 9 * 7 + 5] = p3.y;

			position[index * 8 * 3 * 3 + 9 * 7 + 6] = p2.x;
			position[index * 8 * 3 * 3 + 9 * 7 + 7] = 0;
			position[index * 8 * 3 * 3 + 9 * 7 + 8] = p2.y;

			pA.set(p4.x, 0, p4.y);
			pB.set(p3.x, 0, p3.y);
			pC.set(p2.x, 0, p2.y);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);
			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normal[index * 8 * 3 * 3 + 9 * 7] = nx;
			normal[index * 8 * 3 * 3 + 9 * 7 + 1] = ny;
			normal[index * 8 * 3 * 3 + 9 * 7 + 2] = nz;

			normal[index * 8 * 3 * 3 + 9 * 7 + 3] = nx;
			normal[index * 8 * 3 * 3 + 9 * 7 + 4] = ny;
			normal[index * 8 * 3 * 3 + 9 * 7 + 5] = nz;

			normal[index * 8 * 3 * 3 + 9 * 7 + 6] = nx;
			normal[index * 8 * 3 * 3 + 9 * 7 + 7] = ny;
			normal[index * 8 * 3 * 3 + 9 * 7 + 8] = nz;
		}

		for(var i = 0; i < segments; i++) {
			ring(i);
		}

		var angle1 = -2 * Math.PI * (startAngle) / 360;
		var angle2 = -2 * Math.PI * (startAngle + span) / 360;;

		var p1 = {
			x: Math.cos(angle1) * innerRadius,
			y: Math.sin(angle1) * innerRadius,
		};
		var p2 = {
			x: Math.cos(angle2) * innerRadius,
			y: Math.sin(angle2) * innerRadius,
		};
		var p3 = {
			x: Math.cos(angle1) * outerRadius,
			y: Math.sin(angle1) * outerRadius,
		};
		var p4 = {
			x: Math.cos(angle2) * outerRadius,
			y: Math.sin(angle2) * outerRadius,
		};
		
		//star-1
		position[segments * 8 * 3 * 3] = p1.x;
		position[segments * 8 * 3 * 3 + 1] = 0;
		position[segments * 8 * 3 * 3 + 2] = p1.y;

		position[segments * 8 * 3 * 3 + 3] = p3.x;
		position[segments * 8 * 3 * 3 + 4] = 0;
		position[segments * 8 * 3 * 3 + 5] = p3.y;

		position[segments * 8 * 3 * 3 + 6] = p1.x;
		position[segments * 8 * 3 * 3 + 7] = height;
		position[segments * 8 * 3 * 3 + 8] = p1.y;

		pA.set(p1.x, 0, p1.y);
		pB.set(p3.x, 0, p3.y);
		pC.set(p1.x, height, p1.y);

		cb.subVectors(pC, pB);
		ab.subVectors(pA, pB);
		cb.cross(ab);
		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normal[segments * 8 * 3 * 3] = nx;
		normal[segments * 8 * 3 * 3 + 1] = ny;
		normal[segments * 8 * 3 * 3 + 2] = nz;

		normal[segments * 8 * 3 * 3 + 3] = nx;
		normal[segments * 8 * 3 * 3 + 4] = ny;
		normal[segments * 8 * 3 * 3 + 5] = nz;

		normal[segments * 8 * 3 * 3 + 6] = nx;
		normal[segments * 8 * 3 * 3 + 7] = ny;
		normal[segments * 8 * 3 * 3 + 8] = nz;
		
		//star-2
		position[segments * 8 * 3 * 3+9*1] = p3.x;
		position[segments * 8 * 3 * 3+9*1 + 1] = 0;
		position[segments * 8 * 3 * 3+9*1 + 2] = p3.y;

		position[segments * 8 * 3 * 3+9*1 + 3] = p3.x;
		position[segments * 8 * 3 * 3+9*1 + 4] = height;
		position[segments * 8 * 3 * 3+9*1 + 5] = p3.y;

		position[segments * 8 * 3 * 3+9*1 + 6] = p1.x;
		position[segments * 8 * 3 * 3+9*1 + 7] = height;
		position[segments * 8 * 3 * 3+9*1 + 8] = p1.y;

		pA.set(p3.x, 0, p3.y);
		pB.set(p3.x, height, p3.y);
		pC.set(p1.x, height, p1.y);

		cb.subVectors(pC, pB);
		ab.subVectors(pA, pB);
		cb.cross(ab);
		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normal[segments * 8 * 3 * 3+9*1] = nx;
		normal[segments * 8 * 3 * 3+9*1 + 1] = ny;
		normal[segments * 8 * 3 * 3+9*1 + 2] = nz;

		normal[segments * 8 * 3 * 3+9*1 + 3] = nx;
		normal[segments * 8 * 3 * 3+9*1 + 4] = ny;
		normal[segments * 8 * 3 * 3+9*1 + 5] = nz;

		normal[segments * 8 * 3 * 3+9*1 + 6] = nx;
		normal[segments * 8 * 3 * 3+9*1 + 7] = ny;
		normal[segments * 8 * 3 * 3 +9*1+ 8] = nz;
		
		//end-1
		position[segments * 8 * 3 * 3+9*2] = p4.x;
		position[segments * 8 * 3 * 3+9*2 + 1] = 0;
		position[segments * 8 * 3 * 3+9*2 + 2] = p4.y;

		position[segments * 8 * 3 * 3+9*2 + 3] = p2.x;
		position[segments * 8 * 3 * 3+9*2 + 4] = height;
		position[segments * 8 * 3 * 3+9*2 + 5] = p2.y;

		position[segments * 8 * 3 * 3+9*2 + 6] = p4.x;
		position[segments * 8 * 3 * 3+9*2 + 7] = height;
		position[segments * 8 * 3 * 3+9*2 + 8] = p4.y;

		pA.set(p4.x, 0, p4.y);
		pB.set(p2.x, height, p2.y);
		pC.set(p4.x, height, p4.y);

		cb.subVectors(pC, pB);
		ab.subVectors(pA, pB);
		cb.cross(ab);
		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normal[segments * 8 * 3 * 3+9*2] = nx;
		normal[segments * 8 * 3 * 3+9*2 + 1] = ny;
		normal[segments * 8 * 3 * 3+9*2 + 2] = nz;

		normal[segments * 8 * 3 * 3+9*2 + 3] = nx;
		normal[segments * 8 * 3 * 3+9*2 + 4] = ny;
		normal[segments * 8 * 3 * 3+9*2 + 5] = nz;

		normal[segments * 8 * 3 * 3+9*2 + 6] = nx;
		normal[segments * 8 * 3 * 3+9*2 + 7] = ny;
		normal[segments * 8 * 3 * 3 +9*2+ 8] = nz;
		
		//end-2
		position[segments * 8 * 3 * 3+9*3] = p4.x;
		position[segments * 8 * 3 * 3+9*3 + 1] = 0;
		position[segments * 8 * 3 * 3+9*3 + 2] = p4.y;

		position[segments * 8 * 3 * 3+9*3 + 3] = p2.x;
		position[segments * 8 * 3 * 3+9*3 + 4] = 0;
		position[segments * 8 * 3 * 3+9*3 + 5] = p2.y;

		position[segments * 8 * 3 * 3+9*3 + 6] = p2.x;
		position[segments * 8 * 3 * 3+9*3 + 7] = height;
		position[segments * 8 * 3 * 3+9*3 + 8] = p2.y;

		pA.set(p4.x, 0, p4.y);
		pB.set(p2.x, 0, p2.y);
		pC.set(p2.x, height, p2.y);

		cb.subVectors(pC, pB);
		ab.subVectors(pA, pB);
		cb.cross(ab);
		cb.normalize();

		var nx = cb.x;
		var ny = cb.y;
		var nz = cb.z;

		normal[segments * 8 * 3 * 3+9*3] = nx;
		normal[segments * 8 * 3 * 3+9*3 + 1] = ny;
		normal[segments * 8 * 3 * 3+9*3 + 2] = nz;

		normal[segments * 8 * 3 * 3+9*3 + 3] = nx;
		normal[segments * 8 * 3 * 3+9*3 + 4] = ny;
		normal[segments * 8 * 3 * 3+9*3 + 5] = nz;

		normal[segments * 8 * 3 * 3+9*3 + 6] = nx;
		normal[segments * 8 * 3 * 3+9*3 + 7] = ny;
		normal[segments * 8 * 3 * 3 +9*3+ 8] = nz;
		
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.normal.needsUpdate = true;
		
		geometry.computeBoundingSphere();		
	}
	
	function updateColorTask() {
		var color = this.getAttributeValue('color');
		this.object3D.material.color = new THREE.Color(color);
		this.object3D.material.needsUpdate = true;
	}
	
	function changeMaterial() {
		if(this.object3D) {
			this.object3D.material.dispose();
			this.object3D.material = materials.getMaterial(this.getAttributeValue('material'));
			this.object3D.material.needsUpdate = true;
		}
	}
	
	var xArchColumn = document.registerElement('x-arch-column', {
		prototype: prototype
	});

	return xArchColumn;
});
define('index',['require','./core/materials','./core/x-scene','./core/x-group','./core/x-cube','./core/x-plane','./core/x-canvas-plane','./core/x-canvas-sprite','./core/x-line','./core/x-globe','./core/x-skybox','./core/x-mirror','./core/x-arch-column'],function(require){
	var materials = require('./core/materials');
    var xScene = require('./core/x-scene');
    
	var xGroup = require('./core/x-group');
	var xCube = require('./core/x-cube');
	var xPlane = require('./core/x-plane');
	var xCanvasPlane = require('./core/x-canvas-plane');
	var xCanvasSprite = require('./core/x-canvas-sprite');
	var xLine = require('./core/x-line');
	var xGlobe = require('./core/x-globe');
	
	var xSkyBox = require('./core/x-skybox');
	var xMirror = require('./core/x-mirror');

 	var xArchColumn = require('./core/x-arch-column');
	
	var X3DEE = {version:0.01};
	X3DEE.materials = materials;
	return X3DEE;
});

var X3DEE = require('index');
return X3DEE;
}));
