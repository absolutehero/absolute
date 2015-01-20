/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 7/23/13
 * Time: 2:21 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi', 'absolute/screenmetrics'], function (PIXI, ScreenMetrics) {
    var ParallaxLayer = function (ui, vx) {
        this.initParallaxLayer(ui, vx);
    };

    ParallaxLayer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    ParallaxLayer.prototype.initParallaxLayer = function (ui, vx) {
        PIXI.DisplayObjectContainer.call(this);
        this.ui = ui;
        this.scenes = [];

        var xOffset = 0;
        var scene = this.generateScene(null);
        scene.position.x = xOffset;
        this.scenes.push(scene);
        this.addChild(scene);
        xOffset += scene.width;


        while(xOffset < (this.ui.width + this.scenes[0].width)) {
            scene = this.generateScene(null);
            scene.position.x = xOffset;
            this.scenes.push(scene);
            this.addChild(scene);
            xOffset += scene.width;
        }

        this.originalVelocity = vx;
        this.velocityX = vx;
        this.px = 0;

    };

    ParallaxLayer.prototype.setVelocity = function (vx) {
        this.velocityX = this.originalVelocity * vx;
    };

    ParallaxLayer.prototype.beforeRender = function () {
        if (this.lastTime) {
            var now = Date.now();
            var dx = (now - this.lastTime) * this.velocityX;

            this.px -= dx;

            var xOffset = this.px * ScreenMetrics.getResScale();
            for (var i = 0; i < this.scenes.length; i += 1) {
                this.scenes[i].position.x = xOffset;
                xOffset += this.scenes[i].width;
            }

            if (this.scenes[0].position.x < -this.scenes[0].width) {

                this.scenes.push(this.scenes.shift());
                this.scenes[this.scenes.length - 1].position.x = xOffset;
                this.px = 0;
            }

            this.lastTime = now;
        }
        else {
            this.lastTime = Date.now();
        }
    };

    ParallaxLayer.prototype.afterRender = function () {

    };

    ParallaxLayer.prototype.generateScene = function (oldScene) {

    };

    ParallaxLayer.prototype.handlePause = function() {

    };

    ParallaxLayer.prototype.handleResume = function() {
        this.lastTime = Date.now();
    };

    ParallaxLayer.prototype.reset = function(level) {
        this.lastTime = null;
        this.px = 0;
    };

    return ParallaxLayer;

});