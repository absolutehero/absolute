/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:42 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'tween', 'absolute/screenmetrics', 'absolute/platform', 'absolute/audiomanager'], function (PIXI, TWEEN, ScreenMetrics, Platform, AudioManager) {

    var GameUI = function(container, width, height) {
        this._initGameUI(container, width, height);
    };

    GameUI.prototype._initGameUI = function(container, width, height) {

        this.width = width;
        this.height = height;
        this.container = document.getElementById(container);

        this.stage = new PIXI.Stage(0x0, true);

        // pixi no longer prevents default - need to handle ourselves
        this.stage.mousedown = this.stage.touchstart = function(data)
        {
            data.originalEvent.preventDefault();
        };

        this.renderer = new PIXI.CanvasRenderer(width, height);
        //this.renderer = PIXI.autoDetectRenderer(width, height);
        this.renderer.transparent = true;

        this.offScreenRenderer = new PIXI.CanvasRenderer(width, height);

        this.offScreenRenderer.transparent = true;

        this.container.appendChild(this.renderer.view);

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    };

    GameUI.prototype.resize = function() {

        var windowWidth = document.documentElement.clientWidth,
            windowHeight = document.documentElement.clientHeight;

        var clientWidth = windowWidth,
            clientHeight = windowHeight;

        var aspectRatio = windowWidth / windowHeight;

        if (aspectRatio > 0.9) {
            clientWidth = 0.9 * windowHeight;
        }
        else if (aspectRatio < 0.7) {
            clientHeight = windowWidth / 0.7;
        }
/*
        if (ScreenMetrics.isPortrait()) {
            if (aspectRatio > 0.9) {
                clientWidth = 0.9 * windowHeight;
            }
            else if (aspectRatio < 0.7) {
                clientHeight = windowWidth / 0.7;
            }
        }
        else {
             aspectRatio = 1 / aspectRatio;
             if (aspectRatio > 0.9) {
                 clientWidth = 0.9 * windowHeight;
             }
             else if (aspectRatio < 0.7) {
                 clientHeight = windowWidth / 0.7;
             }
        }
*/
        this.renderer.view.style.width = clientWidth  + "px";
        this.renderer.view.style.height = clientHeight + "px";

        if (clientWidth < windowWidth) {
            this.renderer.view.style.marginLeft = ((windowWidth - clientWidth) / 2) + 'px';
        }
        else {
            this.renderer.view.style.marginLeft = '0';
        }

        if (clientHeight < windowHeight) {
            this.renderer.view.style.marginTop = ((windowHeight - clientHeight) / 2) + 'px';
        }
        else {
            this.renderer.view.style.marginTop = '0';
        }
    };

    GameUI.prototype.loadSound = function(assets, onProgress, onComplete) {

        AudioManager.init(function() {
            AudioManager.loadSounds(assets, onProgress, onComplete);
        });

    };

    GameUI.prototype.loadArt = function(assets, version, onProgress, onComplete) {
        var total = assets.length;

        var paths = new Array();
        for (var i = 0; i < total; ++i) {
            paths.push(Platform.artPathPrefix + '/' + Platform.getResClass() + '/' + assets[i] /* + '?v=' + version */);
        }


        this.assetLoader = new PIXI.AssetLoader(paths);
        this.assetLoader.addEventListener('onComplete', function() {
            onComplete();
        });
        this.assetLoader.addEventListener('onProgress', function(loader) {
            onProgress(1 - (loader.content.loadCount / total));
        });

        this.assetLoader.load();

    };

    GameUI.prototype.render = function() {
        this.renderer.render(this.stage);
    };

    GameUI.prototype.renderOffScreen = function() {
        this.offScreenRenderer.render(this.stage);
    };

    GameUI.prototype.animate = function() {

        var self = this,
            _animate = function () {
                self.beforeRender();
                TWEEN.update();
                self.renderer.render(self.stage);
                self.afterRender();
                requestAnimFrame(_animate);
            };
        requestAnimFrame(_animate);
    };

    GameUI.prototype.beforeRender = function() {

    };

    GameUI.prototype.afterRender = function() {

    };

    return GameUI;
});
