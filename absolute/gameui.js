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
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.portrait = width < height;
        this.container = document.getElementById(container);
        this.stage = [];

        this.stage.push(new PIXI.Stage(0x0, true));
        this.stage.push(new PIXI.Stage(0x0, true));

        if (Debug.enabled) {
            this.meter = new FPSMeter();
        }

        // pixi no longer prevents default - need to handle ourselves
        this.container.onmousedown = this.container.ontouchstart = function(event)
        {
            event.preventDefault();
        };

        this.renderer = [];
        this.renderer.push(new PIXI.CanvasRenderer(width, height));
        this.renderer.push(new PIXI.CanvasRenderer(width, height));
        //this.renderer = PIXI.autoDetectRenderer(width, height);
        this.renderer[0].transparent = true;
        this.renderer[1].transparent = true;

        this.offScreenRenderer = new PIXI.CanvasRenderer(width, height);

        this.offScreenRenderer.transparent = true;

        this.container.appendChild(this.renderer[1].view);
        this.container.appendChild(this.renderer[0].view);

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

        this.renderer[1].view.style.width = this.renderer[0].view.style.width = clientWidth  + "px";
        this.renderer[1].view.style.height = this.renderer[0].view.style.height = clientHeight + "px";
        this.renderer[1].view.style.position = this.renderer[0].view.style.position = "absolute";

        if (clientWidth < windowWidth) {
            this.renderer[1].view.style.left = this.renderer[0].view.style.left = ((windowWidth - clientWidth) / 2) + 'px';
        }
        else {
            this.renderer[1].view.style.left = this.renderer[0].view.style.left = '0';
        }

        if (clientHeight < windowHeight) {
            this.renderer[1].view.style.top = this.renderer[0].view.style.top = ((windowHeight - clientHeight) / 2) + 'px';
        }
        else {
            this.renderer[1].view.style.top =this.renderer[0].view.style.top = '0';
        }
    };

    GameUI.prototype.render = function() {
        this.renderer[0].render(this.stage[0]);
    };

    GameUI.prototype.renderOffScreen = function() {
        this.offScreenRenderer.render(this.stage[0]);
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

                self.renderer[0].render(self.stage[0]);
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

        this.currentScreen = screen;
        this.hideCurrent();
        this.showCurrent();
        this.currentScreen.onShow();

    };

    GameUI.prototype.showModal = function (screen, alpha, hideCurrentScreen) {

        this.modal = screen;
        alpha = typeof alpha === 'number' ? alpha : 0.5;
        hideCurrentScreen = typeof hideCurrentScreen === 'boolean' ? hideCurrentScreen : true;

        if(hideCurrentScreen) {
            var osr = new PIXI.CanvasRenderer(this.width, this.height);

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0x010101, alpha); // PIXI has a bug - won't render pure black
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();
            this.stage[0].addChild(graphics);
            osr.render(this.stage[0]);
            this.stage[0].removeChild(graphics);

            this.modalBG = new PIXI.Sprite(PIXI.Texture.fromCanvas(osr.view));
            this.stage[0].addChild(this.modalBG);
        } else {
            this.modalBG = null;
        }

        this.stage[0].addChild(this.modal);
        this.modal.onShow();

        if(hideCurrentScreen) {
            this.hideCurrent();
        }

    };

    GameUI.prototype.hideModal = function () {
        if (this.modal) {
            this.modal.onHide();
            this.stage[0].removeChild(this.modal);
            if(typeof this.modalBG !== 'undefined' && this.modalBG !== null) {
                this.stage[0].removeChild(this.modalBG);
            }
            this.showCurrent();
        }

        this.modal = null;
    };


    GameUI.prototype.hideCurrent = function () {

        if(this.stage[0].children.length > 0) {
            var oldScreen = this.stage[0].getChildAt(0);
            oldScreen.onHide();
            this.stage[0].removeChild(oldScreen);
        }

        if(this.stage[1].children.length > 0) {
            var oldBackground = this.stage[1].getChildAt(0);
            this.stage[1].removeChild(oldBackground);
        }

    };

    GameUI.prototype.showCurrent = function () {
        if (this.currentScreen) {
            try {
                this.stage[0].addChildAt(this.currentScreen, 0);
                this.stage[1].addChildAt(this.currentScreen.background, 0);
                this.renderer[1].render(this.stage[1]);
            }
            catch (e) {

            }
        }
    };

    return GameUI;
});
