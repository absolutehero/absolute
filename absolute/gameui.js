/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:42 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(
[
    'pixi',
    'tween',
    'absolute/debug',
    'fpsmeter'
],
function (
    PIXI,
    TWEEN,
    Debug,
    FPSMeter
    )
{

    var GameUI = function(container, width, height) {
        this._initGameUI(container, width, height);
    };

    GameUI.prototype._initGameUI = function(container, width, height) {
        this.currentScreen = null;
        this.modal = null;
        this.lastRender = 0;
        this.frameRequest = 0;
        this.width = width;
        this.height = height;
        this.portrait = width < height;
        this.container = document.getElementById(container);
        this.stage = new PIXI.Stage(0x0, true);

        if (Debug.enabled) {
            this.meter = new FPSMeter();
        }

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

        if (this.portrait) {
            if (aspectRatio > 0.83) {
                clientWidth = 0.83 * windowHeight;
            }
            else if (aspectRatio < 0.7) {
                clientHeight = windowWidth / 0.7;
            }
        }
        else {
             aspectRatio = 1 / aspectRatio;
             if (aspectRatio > 0.83) {
                 clientHeight = 0.83 * windowWidth;
             }
             else if (aspectRatio < 0.65) {
                 clientWidth = windowHeight / 0.65;
             }
        }

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

    GameUI.prototype.render = function() {
        this.renderer.render(this.stage);
    };

    GameUI.prototype.renderOffScreen = function() {
        this.offScreenRenderer.render(this.stage);
    };

    GameUI.prototype.animate = function() {

        var watchdog = function() {
            // watchdog
            if (new Date().getTime() - this.lastRender > 200) {
                cancelAnimationFrame(this.frameRequest);
                this.frameRequest = requestAnimFrame(_animate); // restart
            }
            setTimeout(watchdog, 100);
        }.bind(this);

        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
        }

        var self = this,
            _animate = function () {
                if (Debug.enabled) {
                    self.meter.tick();
                }
                self.beforeRender();
                TWEEN.update();
                self.renderer.render(self.stage);
                self.afterRender();
                self.lastRender = new Date().getTime();
                self.frameRequest = requestAnimFrame(_animate);
            };
        this.frameRequest = requestAnimFrame(_animate);
        setTimeout(watchdog, 100);

    };

    GameUI.prototype.beforeRender = function() {

    };

    GameUI.prototype.afterRender = function() {

    };

    GameUI.prototype.showScreen = function (screen) {
        if (this.currentScreen) {
            this.currentScreen.onHide();
            this.hideCurrent();
        }
        this.currentScreen = screen;

        if (this.currentScreen) {
            this.showCurrent();
            this.currentScreen.onShow();
        }
    };

    GameUI.prototype.showModal = function (screen, alpha) {
        this.modal = screen;

        var osr = new PIXI.CanvasRenderer(this.width, this.height);

        var graphics = new PIXI.Graphics();
        graphics.beginFill(0x010101, 0.5); // PIXI has a bug - won't render pure black
        graphics.drawRect(0, 0, this.width, this.height);
        graphics.endFill();
        this.stage.addChild(graphics);
        osr.render(this.stage);
        this.stage.removeChild(graphics);

        this.modalBG = new PIXI.Sprite(PIXI.Texture.fromCanvas(osr.view));
        //this.modalBG.alpha = alpha || 0.5;

        this.hideCurrent();
        this.stage.addChild(this.modalBG);
        this.stage.addChild(this.modal);
        this.modal.onShow();
    };

    GameUI.prototype.hideModal = function () {
        if (this.modal) {
            this.modal.onHide();
            this.stage.removeChild(this.modal);
            this.stage.removeChild(this.modalBG);
            this.showCurrent();
        }

        this.modal = null;
    };


    GameUI.prototype.hideCurrent = function () {
        if (this.currentScreen) {
            try {
                this.stage.removeChild(this.currentScreen);
            }
            catch (e) {
                // may not have been added
            }
        }
    };

    GameUI.prototype.showCurrent = function () {
        if (this.currentScreen) {
            try {
                this.stage.addChild(this.currentScreen);
            }
            catch (e) {

            }
        }
    };

    return GameUI;
});
