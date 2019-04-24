define(function() {
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
        }
    }

    function HotspotMark(text) {
        var canvas = document.createElement('canvas');

        var img = document.getElementById("scream");

        function drawGui(width, height) {
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext("2d");

            context.drawImage(img, 0, 0, 963, 420);
            context.fillStyle = "#EEEEEE";
            context.font = "500 40px SimHei";

            context.textAlign = "start";
            context.fillTextarea(text, 25, 85, width - 80, 270, 60);

            context.fillText('2015 - 02 - 22', 625, 385);
        }
        drawGui(960, 420);

        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;

        var material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1

        });

        THREE.Sprite.call(this, material);
        this.scale.set(64, 28, 28)
    }
    HotspotMark.prototype = Object.create(THREE.Sprite.prototype);
    HotspotMark.prototype.constructor = HotspotMark;

    return HotspotMark;
});
