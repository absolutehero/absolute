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
    'absolute/platform',
    'absolute/coords',
    'fpsmeter'
],
function (
    PIXI,
    TWEEN,
    Debug,
    ScreenMetrics,
    Platform,
    Coords,
    FPSMeter
    )
{

    var GameUI = function(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL) {
        backgroundColor = backgroundColor || 0xFFFFFF;
        this._initGameUI(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL);
    };

    GameUI.prototype._initGameUI = function(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL) {

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
        this.supportsLiquidLayout = !!supportsLiquidLayout;
        this.supportsWebGL = !!supportsWebGL;
        this.usingWebGL = false;
        this.DIALOG_LAYER = 0;
        this.modalStack = [];
        this.modalBgStack = [];

        this.stage.push(new PIXI.Stage(0x0, true));
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
            if (this.supportsWebGL) {
                this.renderer.push(PIXI.autoDetectRenderer(width, height, null, true));
                this.renderer.push(PIXI.autoDetectRenderer(width, height, null, true));

                if (this.renderer[1] instanceof PIXI.WebGLRenderer) {
                    this.renderer.push(PIXI.autoDetectRenderer(width, height, null, true));
                    this.usingWebGL = true;
                    this.DIALOG_LAYER = 2;
                }
            }
            else {
                this.renderer.push(new PIXI.CanvasRenderer(width, height, null, true));
                this.renderer.push(new PIXI.CanvasRenderer(width, height, null, true));
            }

            this.offScreenRenderer = new PIXI.CanvasRenderer(width, height, null, true);
            //this.offScreenRenderer.transparent = true;

            this.container.appendChild(this.renderer[1].view);
            this.container.appendChild(this.renderer[0].view);
            if (this.usingWebGL) {
                this.renderer[2].view.style.display = "none";
                this.container.appendChild(this.renderer[2].view);
            }
        }
        else {
            for (var i = 0; i < this.renderer.size; i += 1) {
                if (this.usingWebGL) {
                    this.renderer[i].resize(width, height);
                }
                else {
                    this.renderer[i].width = this.renderer[i].view.width = width;
                    this.renderer[i].height = this.renderer[i].view.height = height;
                }
            }

            this.refreshBackground = true;
        }
    };

    GameUI.prototype.resize = function() {
        var i, fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

        if (this.container.style.width !== "" && this.container.style.height !== "" && !fullscreenElement) {
            this.buildRenderers(this.width, this.height);

            for (i = 0; i < this.renderer.length; i += 1) {
                this.renderer[i].view.style.width = this.container.style.width;
                this.renderer[i].view.style.height = this.container.style.height;
                this.renderer[i].view.style.position = "absolute";
                this.renderer[i].view.style.left = "";
                this.renderer[i].view.style.top = "";
            }
        }
        else {

            ScreenMetrics.refresh();

            var windowWidth = ScreenMetrics.clientWidth > 0 ? ScreenMetrics.clientWidth : ScreenMetrics.screenWidth,
                windowHeight = ScreenMetrics.clientWidth > 0 ? ScreenMetrics.clientHeight : ScreenMetrics.screenHeight;

            var clientWidth = windowWidth,
                clientHeight = windowHeight;

            if (this.supportsOrientationChange) {
                this.portrait = clientWidth < clientHeight;
            }
            else {
                this.portrait = this.width < this.height;
            }

            var aspectRatio = windowWidth / windowHeight;

            if (!this.supportsLiquidLayout) {
                if (this.portrait) {

                    if (this.supportsOrientationChange && this.width > this.height) {

                        this.baseWidth = this.origBaseHeight;
                        this.baseHeight = this.origBaseWidth;
                        this.width = this.origHeight;
                        this.height = this.origWidth;

                    }

                    if (aspectRatio > 0.85) {
                        clientWidth = 0.85 * windowHeight;
                    }
                    else if (aspectRatio < 0.56) {
                        clientHeight = windowWidth / 0.56;
                    }
                }
                else {
                    // fix for a bug on iPad where bottom of screen is chopped off
                    if (Platform._isiPad) {
                        //windowHeight -=  Coords.y(18);
                        clientHeight -= Coords.y(18);
                    }

                    if (this.supportsOrientationChange && this.height > this.width) {

                        this.baseWidth = this.origBaseWidth;
                        this.baseHeight = this.origBaseHeight;
                        this.width = this.origWidth;
                        this.height = this.origHeight;

                    }

                    aspectRatio = 1 / aspectRatio;

                    if (aspectRatio > 0.80) {
                        clientHeight = 0.80 * windowWidth;
                    }
                    else if (aspectRatio < 0.56) {
                        clientWidth = windowHeight / 0.56;
                    }
                }

                clientWidth = Math.floor(clientWidth);
                clientHeight = Math.floor(clientHeight);
            }
            else {
                if (this.supportsLiquidLayout) {
                    if (this.portrait) {
                        this.width = Math.floor(1536 * ScreenMetrics.getResScale());
                        this.height = Math.floor(this.width * (windowHeight/windowWidth));
                    }
                    else {
                        // fix for a bug on iPad where bottom of screen is chopped off
                        if (Platform._isiPad) {
                            windowHeight -=  Coords.y(18);
                            clientHeight -= Coords.y(18);
                        }

                        this.height = Math.floor(1536 * ScreenMetrics.getResScale());
                        this.width = Math.floor(Math.floor(this.height * (windowWidth/windowHeight)));
                    }
                }
            }

            this.buildRenderers(this.width, this.height);

            this.clientWidth = clientWidth;

            for (i = 0; i < this.renderer.length; i += 1) {
                this.renderer[i].view.style.width = clientWidth  + "px";
                this.renderer[i].view.style.height = clientHeight + "px";
                this.renderer[i].view.style.position = "absolute";

                if (clientWidth < windowWidth) {
                    this.renderer[i].view.style.left = Math.round((windowWidth - clientWidth) / 2) + 'px';
                }
                else {
                    this.renderer[i].view.style.left = '0';
                }

                if (clientHeight < windowHeight) {
                    this.renderer[i].view.style.top = Math.round((windowHeight - clientHeight) / 2) + 'px';
                }
                else {
                    this.renderer[i].view.style.top = '0';
                }
            }

            this.resetStage();

            if (this.supportsOrientationChange && this.currentScreen) {
                this.currentScreen.handleOrientationChange(this.portrait);
            }

            this.refreshModal();
        }

    };

    GameUI.prototype.refreshModal = function () {

        if (this.supportsOrientationChange && this.modalStack.length > 0) {
            var modal = this.modalStack[this.modalStack.length - 1];

            // remove the current modal
            this.stage[this.DIALOG_LAYER].removeChild(modal);

            // refresh the background snapshot
            if (typeof modal.handleOrientationChange !== 'undefined') {
               modal.handleOrientationChange(this.portrait);
            }

            // refresh the modal content
            this.stage[this.DIALOG_LAYER].addChild(modal);
            modal.onShow();
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

                self.renderer[0].render(self.stage[0]);
                if (self.refreshBackground) {
                    self.refreshBackground = false;
                    self.renderer[1].render(self.stage[1]);
                }

                if (self.hasModal() && self.renderer.length > 2) {
                    self.renderer[2].render(self.stage[2]);
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

        this.showActiveAtlases();
    };


    GameUI.prototype.showModal = function (screen, alpha) {
        alpha = alpha || 0.5;

        if (this.modalStack.length === 0) {

            if (!this.usingWebGL) {
                this.modalBG = this.buildModalBackground(alpha);
                this.stage[0].removeChild(this.currentScreen);
                this.stage[0].addChildAt(this.modalBG, 0);
            }
            else {
                this.modalOverlay = this.buildModalOverlay(alpha);
                this.currentScreen.addChild(this.modalOverlay);
                this.renderer[2].view.style.display = "block";
            }
        }
        else {
            this.stage[this.DIALOG_LAYER].removeChild(this.modalStack[this.modalStack.length - 1]);
        }

        this.modalStack.push(screen);
        this.stage[this.DIALOG_LAYER].addChild(screen);
        screen.onShow();

        this.showActiveAtlases();
    };

    GameUI.prototype.hasModal = function () {
        return (this.modalStack.length > 0);
    };

    GameUI.prototype.hideModal = function () {
        if (this.modalStack.length > 0) {
            // hide the modal
            var modal = this.modalStack.pop();
            modal.onHide();
            this.stage[this.DIALOG_LAYER].removeChild(modal);

            // restore the last modal or screen
            var l = this.modalStack.length;
            if (l === 0) {


                if (!this.usingWebGL) {
                    this.stage[0].removeChild(this.modalBG);
                    this.stage[0].addChildAt(this.currentScreen, 0);
                }
                else {
                    this.currentScreen.removeChild(this.modalOverlay);
                    this.renderer[2].view.style.display = "none";
                }
            }
            else {
                this.stage[this.DIALOG_LAYER].addChild(this.modalStack[l - 1]);
                this.refreshModal();
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

    GameUI.prototype.buildModalOverlay = function (alpha) {

        var container = new PIXI.DisplayObjectContainer();
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0x010101, alpha); // PIXI has a bug - won't render pure black
        graphics.drawRect(0, 0, this.width, this.height);
        graphics.endFill();
        container.addChild(graphics);

        return container;
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
                this.renderer[1].render(this.stage[1]);
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

        if(this.stage[1].children.length == 0) {

            return false;

        } else {

            for(var i =0; i < this.stage[1].children.length; i ++ ) {
                this.stage[1].removeChildAt(i);
            }

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

            this.stage[1].removeChildAt(0);

            if(this.stage[0].children.length > 0) {
                var oldScreen = this.stage[0].getChildAt(0);
                oldScreen.visible = true;
            }

            if(this.modal) {
                this.modal.visible = true;
            }

            if(this.currentScreen && this.currentScreen.background) {
                this.stage[1].addChild(this.currentScreen.background);
                this.renderer[1].render(this.stage[1]);
            }

        }.bind(this), 500);

    };

    GameUI.prototype.showActiveAtlases = function () {
        var activeAtlases = {};
        this.walkSprites(this.stage[0], function (dob) {
            if (dob instanceof PIXI.Sprite) {
                if (dob.texture && dob.texture.baseTexture) {
                    //console.log(dob.texture.baseTexture.source.src);
                    var atlasName = dob.texture.baseTexture.source.src || "/offscreen"
                    activeAtlases[atlasName] = (activeAtlases[atlasName] || 0) + 1;
                }
            }
        });

        console.log("Active Atlases");
        for (var atlas in activeAtlases) {
            if (activeAtlases.hasOwnProperty(atlas)) {
                var shortName = atlas.substr(atlas.lastIndexOf("/") + 1);
                console.log(shortName + " has " + activeAtlases[atlas] + " sprites active");
            }
        }
    };

    // walk the sprites in a graph an perform operation
    GameUI.prototype.walkSprites = function (dob, operation) {

        operation(dob);

        for (var c = 0; c < dob.children.length; c += 1) {
            this.walkSprites(dob.children[c], operation);
        }
    };


    return GameUI;
});
