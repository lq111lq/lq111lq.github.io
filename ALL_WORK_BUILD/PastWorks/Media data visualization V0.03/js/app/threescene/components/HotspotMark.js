define(['threescene/Resources'], function(Resources) {
    CanvasRenderingContext2D.prototype.fillTextarea = function(text, x, y, width, height, lineHeight) {
        var strArr = [];
        lineHeight = lineHeight || 25;
        var count = 1;

        for (var i = 0; i < text.length && count * lineHeight < height; i++) {
            var char = text.charAt(i);
            var code = text.charCodeAt(i);
            strArr.push(char);
            if (this.measureText(strArr.join('')).width > width || code === 10) {
                strArr.pop();
                this.fillText(strArr.join(''), x, y + lineHeight * count, width);
                count++;
                strArr = [];
                strArr.push(char);
            }
        }
        if (count * lineHeight < height) {
            this.fillText(strArr.join(''), x, y + lineHeight * count, width);
            count++;
        }
        return count * lineHeight;
    }

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var width = 960;
    var height = 980;

    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
    });

    hotspotMark = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), material);

    function getHotspotMark(title, text, time, author, type) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var img = Resources['hotspotMarkBg'];
        var img2 = Resources['type-' + type];
        canvas.width = width;
        canvas.height = height;
        context.drawImage(img, 0, 0, width, height);
        context.drawImage(img2, 5, 5, 58, 56);
        context.fillStyle = '#EEEEEE';

        context.textAlign = 'center';
        context.font = '60px myFont';
        context.fillText(title || '最新微博', 480, 110);

        context.font = '30px myFont';
        context.fillText(author + ' ' + time, 480, 170);

        context.lineWidth = 1;
        context.strokeStyle = '#3DA0DD';
        context.moveTo(0, 125);
        context.lineTo(125, 0);
        context.stroke();

        context.textAlign = 'start';
        context.font = '40px myFont';
        context.fillTextarea(text, 40, 185, width - 80, 775, 60);

        if(hotspotMark.material && hotspotMark.material.map){
            hotspotMark.material.map.image = canvas;
            hotspotMark.material.map.needsUpdate = true;
        } 

        return hotspotMark;
    }


    return getHotspotMark;
});
