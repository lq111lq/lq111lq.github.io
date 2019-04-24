define(function() {
    Resources = {};

    var resourcesUrl = [{
        id: 'earth_texture',
        src: 'img/globe-8192.jpg'
    }, {
        id: 'earth_specular_texture',
        src: 'img/earth_specular_8192.jpg'
    }, {
        id: 'earth_bump_texture',
        src: 'img/bump_8192.jpg'
    }, {
        id: 'star_cloud_texture_1',
        src: 'img/cloud1.jpg'
    }, {
        id: 'star_cloud_texture_2',
        src: 'img/cloud2.jpg'
    }, {
        id: 'star_cloud_texture_3',
        src: 'img/cloud3.jpg'
    }, {
        id: 'star_cloud_texture_4',
        src: 'img/cloud4.jpg'
    }, {
        id: 'star_texture',
        src: 'img/spark.png'
    }, {
        id: 'earth_lights_texture',
        src: 'img/earth_lights_2048.png'
    }, {
        id: 'earth_clouds_texture',
        src: 'img/earth_clouds_2048.png'
    }, {
        id: 'hexangle',
        src: 'img/lensflare/hexangle.png'
    }, {
        id: 'lensflare0',
        src: 'img/lensflare/lensflare0.png'
    }, {
        id: 'lensflare0_alpha',
        src: 'img/lensflare/lensflare0_alpha.png'
    }, {
        id: 'lensflare1',
        src: 'img/lensflare/lensflare1.png'
    }, {
        id: 'lensflare2',
        src: 'img/lensflare/lensflare2.png'
    }, {
        id: 'lensflare3',
        src: 'img/lensflare/lensflare3.png'
    }, {
        id: 'lensflare4',
        src: 'img/lensflare/lensflare4.jpg'
    }, {
        id: 'th',
        src: 'img/lensflare/th.jpg'
    }, {
        id: 'epic',
        src: 'img/lensflare/epic.jpg'
    }, {
        id: 'hotspotMarkBg',
        src: 'img/hotspotMarkBg.png'
    }, {
        id: 'type-0',
        src: 'img/type-0.png'
    }, {
        id: 'type-1',
        src: 'img/type-1.png'
    }, {
        id: 'type-2',
        src: 'img/type-2.png'
    },{
        id: 'glow',
        src: 'img/glow.png'
    }];

    var ready = false;
    Resources.ready = function(fn) {
        var loader = new createjs.LoadQueue(true);
        loader.addEventListener('fileload', function(e) {
            var id = e.item.id;
            Resources[id] = e.result;
        });
        loader.addEventListener('complete', function() {
            ready = true;
            fn();
        });
        loader.loadManifest(resourcesUrl);
        loader.load();
    }
    Resources.getTexture = function(id) {
        var texture = new THREE.Texture();
        texture.image = Resources[id];
        texture.needsUpdate = true;
        return texture;
    }
    return Resources;
});
