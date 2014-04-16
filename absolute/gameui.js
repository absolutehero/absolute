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
    'absolute/screenmetrics',
    'absolute/particlesystem',
    'absolute/platform',
    'fpsmeter'
],
function (
    PIXI,
    TWEEN,
    Debug,
    ScreenMetrics,
    ParticleSystem,
    Platform,
    FPSMeter
    )
{

    var GameUI = function(container, width, height, backgroundColor, supportsOrientationChange) {
        backgroundColor = backgroundColor || 0xFFFFFF;
        this._initGameUI(container, width, height, backgroundColor, supportsOrientationChange);
    };

    GameUI.prototype._initGameUI = function(container, width, height, backgroundColor, supportsOrientationChange) {

        this.currentScreen = null;
        this.modal = null;
        this.lastRender = 0;
        this.frameRequest = 0;
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.baseWidth = width;
        this.baseHeight = height;

        this.origWidth = this.width;
        this.origHeight = this.height;
        this.origBaseWidth = this.baseWidth;
        this.origBaseHeight = this.baseHeight;
        this.container = document.getElementById(container);
        this.stage = [];
        this.refreshBackground = false;
        this.backGroundColor = backgroundColor;
        this.supportsOrientationChange = !!supportsOrientationChange;
        this.modalStack = [];
        this.modalBgStack = [];

        this.stage.push(new PIXI.Stage(0x0, true));
        this.stage.push(new PIXI.Stage(0x0, true));

        if (Debug.enabled) {
            this.meter = new FPSMeter();
        }
        // this fixes a strange issue with kik that prevents rendering
        if (typeof kik !== "undefined") {
            document.getElementsByTagName('body')[0].appendChild(document.createElement('div'));
        }

        // pixi no longer prevents default - need to handle ourselves
        this.container.onmousedown = this.container.ontouchstart = function(event)
        {
            event.preventDefault();
        };


        this.renderer = [];

        ParticleSystem.init();

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();

    };

    GameUI.prototype.buildRenderers = function (width, height) {

        if(Platform._isOldAndroid()) {
            // fixes https://github.com/absolutehero/puppy/issues/56
            // for reasons I don't comprehend rounding the canvas width/height on old anroid browsers causes complete
            // rendering failure. All positioning data is off and the games become unplayable.
            width = this.baseWidth;
            height = this.baseHeight;

        }

        if (this.renderer.length === 0) {
            this.renderer.push(new PIXI.CanvasRenderer(width, height, null, true));
            this.renderer.push(new PIXI.CanvasRenderer(width, height, null, true));
            //this.renderer = PIXI.autoDetectRenderer(width, height);
            //this.renderer[0].transparent = true;
            //this.renderer[1].transparent = true;

            this.offScreenRenderer = new PIXI.CanvasRenderer(width, height, null, true);
            //this.offScreenRenderer.transparent = true;

            this.container.appendChild(this.renderer[1].view);
            this.container.appendChild(this.renderer[0].view);
        }
        else {
            this.renderer[0].width = this.renderer[0].view.width = width;
            this.renderer[0].height = this.renderer[0].view.height = height;
            this.renderer[1].width = this.renderer[1].view.width = width;
            this.renderer[1].height = this.renderer[1].view.height = height;
            this.refreshBackground = true;
        }
    };

    GameUI.prototype.resize = function() {

        var windowWidth = document.documentElement.clientWidth,
            windowHeight = document.documentElement.clientHeight;

        var clientWidth = windowWidth,
            clientHeight = windowHeight;

        if (this.supportsOrientationChange) {
            this.portrait = clientWidth < clientHeight;
        }
        else {
            this.portrait = this.width < this.height;
        }

        var aspectRatio = windowWidth / windowHeight;

        if (this.portrait) {

            if (this.supportsOrientationChange && this.width > this.height) {

                this.baseWidth = this.origBaseHeight;
                this.baseHeight = this.origBaseWidth;
                this.width = this.origHeight;
                this.height = this.origWidth;

            }

            if (aspectRatio > 0.83) {
                clientWidth = 0.83 * windowHeight;
            }
            else if (aspectRatio < 0.56) {
                clientHeight = windowWidth / 0.56;
            }
        }
        else {
            if (this.supportsOrientationChange && this.height > this.width) {

                this.baseWidth = this.origBaseWidth;
                this.baseHeight = this.origBaseHeight;
                this.width = this.origWidth;
                this.height = this.origHeight;

            }

             aspectRatio = 1 / aspectRatio;

             if (aspectRatio > 0.70) {
                 clientHeight = 0.70 * windowWidth;
             }
             else if (aspectRatio < 0.56) {
                 clientWidth = windowHeight / 0.56;
             }
        }

        clientWidth = Math.floor(clientWidth);
        clientHeight = Math.floor(clientHeight);

        this.buildRenderers(this.width, this.height);

        this.renderer[1].view.style.width = this.renderer[0].view.style.width = clientWidth  + "px";
        this.renderer[1].view.style.height = this.renderer[0].view.style.height = clientHeight + "px";
        this.renderer[1].view.style.position = this.renderer[0].view.style.position = "absolute";

        if (clientWidth < windowWidth) {
            this.renderer[1].view.style.left = this.renderer[0].view.style.left = Math.round((windowWidth - clientWidth) / 2) + 'px';
        }
        else {
            this.renderer[1].view.style.left = this.renderer[0].view.style.left = '0';
        }

        if (clientHeight < windowHeight) {
            this.renderer[1].view.style.top = this.renderer[0].view.style.top = Math.round((windowHeight - clientHeight) / 2) + 'px';
        }
        else {
            this.renderer[1].view.style.top =this.renderer[0].view.style.top = '0';
        }

        this.resetStage();
        if (this.supportsOrientationChange && this.currentScreen) {
            this.currentScreen.handleOrientationChange(this.portrait);
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
            if (Date.now() - this.lastRender > 200) {
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

                ParticleSystem.update();
                self.renderer[0].render(self.stage[0]);
                if (self.refreshBackground) {
                    self.refreshBackground = false;
                    self.renderer[1].render(self.stage[1]);
                }
                self.afterRender();
                self.lastRender = Date.now();
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
        }
        this.currentScreen = screen;
        this.hideCurrent();
        this.showCurrent();
        this.currentScreen.onShow(this.portrait);
    };

    /*
    GameUI.prototype.showModal = function (screen, alpha, hideCurrentScreen) {

        this.modal = screen;
        alpha = typeof alpha === 'number' ? alpha : 0.5;
        hideCurrentScreen = typeof hideCurrentScreen === 'boolean' ? hideCurrentScreen : true;

        if(hideCurrentScreen) {

            var osr = new PIXI.CanvasRenderer(this.width, this.height, null, true);

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0x010101, alpha); // PIXI has a bug - won't render pure black
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();
            this.stage[0].addChild(graphics);
            osr.render(this.stage[0]);
            this.stage[0].removeChild(graphics);

            this.hideCurrent();

            this.modalBG = new PIXI.Sprite(PIXI.Texture.fromCanvas(osr.view));
            this.stage[0].addChild(this.modalBG);

        } else {

            this.modalBG = null;

        }

        this.stage[0].addChild(this.modal);
        this.modal.onShow();

    };

    GameUI.prototype.hideModal = function () {
        if (this.modal) {
            this.modal.onHide();
            this.stage[0].removeChild(this.modal);
            if(typeof this.modalBG !== 'undefined' && this.modalBG !== null) {
                this.stage[0].removeChild(this.modalBG);
            } else if (this.stage[1].children.length > 0) {
                var oldBackground = this.stage[1].getChildAt(0);
                this.stage[1].removeChild(oldBackground);
            }
            this.showCurrent();
        }

        this.modal = null;
    };
    */

    GameUI.prototype.showModal = function (screen, alpha) {
        var modalBackground = this.buildModalBackground(alpha || 0.5);

        if (this.modalBgStack.length > 0) {
            this.stage[0].removeChild(this.modalBgStack[this.modalBgStack.length - 1]);
        }
        else {
            this.hideCurrent();
        }

        this.modalBgStack.push(modalBackground);
        this.stage[0].addChild(modalBackground);

        this.modalStack.push(screen);
        this.stage[0].addChild(screen);
        screen.onShow();
    };

    GameUI.prototype.hideModal = function () {
        if (this.modalStack.length > 0) {
            // hide the modal
            var modal = this.modalStack.pop();
            modal.onHide();
            this.stage[0].removeChild(modal);

            // remove the background
            var modalBG = this.modalBgStack.pop();
            if(typeof modalBG !== 'undefined' && modalBG !== null) {
                this.stage[0].removeChild(modalBG);
            } else if (this.stage[1].children.length > 0) {
                var oldBackground = this.stage[1].getChildAt(0);
                this.stage[1].removeChild(oldBackground);
            }

            // restore the last modal or screen
            var l = this.modalStack.length;
            if (l === 0) {
                this.showCurrent();
            }
            else {
                this.stage[0].addChild(this.modalBgStack[l - 1]);
                this.stage[0].addChild(this.modalStack[l - 1]);
            }
        }
    };

    GameUI.prototype.hideCurrent = function () {

        if(this.stage[0].children.length > 0) {
            var oldScreen = this.stage[0].getChildAt(0);
            this.stage[0].removeChild(oldScreen);
        }

        if(this.stage[1].children.length > 0) {
            var oldBackground = this.stage[1].getChildAt(0);
            this.stage[1].removeChild(oldBackground);
        }

    };

    GameUI.prototype.buildModalBackground = function (alpha) {
        var osr = new PIXI.CanvasRenderer(this.width, this.height, null, true);
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0x010101, alpha); // PIXI has a bug - won't render pure black
        graphics.drawRect(0, 0, this.width, this.height);
        graphics.endFill();
        this.stage[0].addChild(graphics);
        osr.render(this.stage[0]);
        this.stage[0].removeChild(graphics);

        return new PIXI.Sprite(PIXI.Texture.fromCanvas(osr.view));
    };

    GameUI.prototype.showCurrent = function () {
        if (this.currentScreen) {
            try {
                this.stage[0].addChildAt(this.currentScreen, 0);
                this.stage[1].addChildAt(this.currentScreen.background, 0);
                this.refreshBackground = true;
            }
            catch (e) {

            }
        }
    };

    /**
     * This method resolves canvas artifacts on orientation change on some android devices.
     */
    GameUI.prototype.resetStage = function() {

        if(this.stage[1].children.length > 0) {
            var oldScreen = this.stage[1].getChildAt(0);
            this.stage[1].removeChild(oldScreen);
        }

        if(this.stage[0].children.length > 0) {
            var oldScreen = this.stage[0].getChildAt(0);
            oldScreen.visible = false;
        }
        if(this.modal) {
            this.modal.visible = false;
        }

        var cover = new PIXI.Graphics();
        cover.beginFill(this.backGroundColor, 1.0);
        cover.drawRect(0, 0, this.width, this.height);
        cover.endFill();

        this.stage[1].addChildAt(cover, 0);
        this.renderer[1].render(this.stage[1]);

        window.setTimeout(function() {

            if(this.stage[1].children.length > 0) {
                var tempBackground = this.stage[1].getChildAt(0);
                this.stage[1].removeChild(tempBackground);
            }

            if(this.stage[0].children.length > 0) {
                var oldScreen = this.stage[0].getChildAt(0);
                oldScreen.visible = true;
            }

            if(this.modal) {
                this.modal.visible = true;
            }

            if(this.currentScreen && this.currentScreen.background) {
                this.stage[1].addChildAt(this.currentScreen.background, 0);
                this.renderer[1].render(this.stage[1]);
            }

        }.bind(this), 500);

    };


    return GameUI;
});
