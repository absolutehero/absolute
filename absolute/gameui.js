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
    'fpsmeter',
    'lodash'
],
function (
    PIXI,
    TWEEN,
    Debug,
    ScreenMetrics,
    Platform,
    Coords,
    FPSMeter,
    _
    )
{

    var GameUI = function(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL, lockAspectRatio) {
        backgroundColor = backgroundColor || 0xFFFFFF;
        this._initGameUI(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL, lockAspectRatio);
    };

    GameUI.prototype._initGameUI = function(container, width, height, backgroundColor, supportsOrientationChange, supportsLiquidLayout, supportsWebGL, lockAspectRatio) {

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
        this.backgroundColor = backgroundColor;
        this.supportsOrientationChange = !!supportsOrientationChange;
        this.supportsLiquidLayout = !!supportsLiquidLayout;
        this.supportsWebGL = !!supportsWebGL && Platform.supportsWebGL();
        this.usingWebGL = false;
        this.lockAspectRatio = !!lockAspectRatio;
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

    GameUI.prototype._createPIXIRenderer = function (width, height, auto) {
        var pixiVersion = PIXI.VERSION.substring(1).split("."),
            renderer;

        if (parseInt(pixiVersion[0]) < 2) {
            if (auto) {
                renderer = PIXI.autoDetectRenderer(width, height, null, true);
            }
            else {
                renderer = new PIXI.CanvasRenderer(width, height, null, true);
            }
        }
        else {
            var renderOptions = {
                view: null,
                transparent: true,
                autoResize: false,
                antialias: false,
                preserveDrawingBuffer: false,
                resolution: 1
            };

            if (auto) {
                renderer = PIXI.autoDetectRenderer(width, height, renderOptions)
            }
            else {
                renderer = new PIXI.CanvasRenderer(width, height, renderOptions)
            }
        }

        return renderer;
    };

    GameUI.prototype.buildRenderers = function (width, height) {

        if(Platform._isOldAndroid() && !this.supportsOrientationChange) {
            // fixes https://github.com/absolutehero/puppy/issues/56
            // for reasons I don't comprehend rounding the canvas width/height on old anroid browsers causes complete
            // rendering failure. All positioning data is off and the games become unplayable.
            width = this.baseWidth;
            height = this.baseHeight;
        }

        if (this.renderer.length === 0) {
            if (this.supportsWebGL) {
                this.renderer.push(this._createPIXIRenderer(width, height, true));
                this.renderer.push(this._createPIXIRenderer(width, height, true));

                if (this.renderer[1] instanceof PIXI.WebGLRenderer) {
                    this.renderer.push(this._createPIXIRenderer(width, height, true));
                    this.usingWebGL = true;
                    this.DIALOG_LAYER = 2;
                }
            }
            else {
                this.renderer.push(this._createPIXIRenderer(width, height, false));
                this.renderer.push(this._createPIXIRenderer(width, height, false));
            }

            this.offScreenRenderer = this._createPIXIRenderer(width, height, false);
            //this.offScreenRenderer.transparent = true;

            this.container.appendChild(this.renderer[1].view);
            this.container.appendChild(this.renderer[0].view);
            if (this.usingWebGL) {
                this.renderer[2].view.style.display = "none";
                this.container.appendChild(this.renderer[2].view);
            }
        }
        else {
            for (var i = 0; i < this.renderer.length; i += 1) {
                this.renderer[i].resize(width, height);
            }

            this.refreshBackground = true;
        }
    };

    GameUI.prototype.isPortrait = function() {
        return this.portrait;
    };

    GameUI.prototype.isFullScreen = function () {
        return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    };

    GameUI.prototype.requestFullscreen = function (element) {

        this.fullScreenElementStyles = element.cssText;
        this.fullScreenElementClass = element.className;

        element.removeAttribute('style');
        element.style.position = 'static';
        element.className = '';
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }

    };

    GameUI.prototype.exitFullScreen = function (element) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen){
            document.msExitFullscreen();
        };

        if(element) {
            element.className = this.fullScreenElementClass;
            element.removeAttribute('style');
            element.cssText = this.fullScreenElementStyles;
        }

        window.setTimeout(function(){
            this.resize();
        }.bind(this), 1000);

    };

    GameUI.prototype.resize = function() {

        var i, fullscreenElement = this.isFullScreen();

        if (this.container.style.width !== "" && this.container.style.height !== "" && !fullscreenElement) {
            this.width = this.origWidth;
            this.height = this.origHeight;
            this.buildRenderers(this.width, this.height);

            for (i = 0; i < this.renderer.length; i += 1) {
                this.renderer[i].view.style.width = this.container.style.width;
                this.renderer[i].view.style.height = this.container.style.height;
                this.renderer[i].view.style.position = "absolute";
                this.renderer[i].view.style.left = "";
                this.renderer[i].view.style.top = "";
            }

            if (this.supportsOrientationChange && this.currentScreen) {
                this.portait = this.height > this.width;
                this.currentScreen.handleOrientationChange(this.portrait);
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

            function scaleToAspectRatio () {

                if (Platform._isiPad && !this.portrait && !Platform.isNativeMobile()) {
                    windowHeight = windowHeight - Coords.y(30);
                }
                var trueAspectRatio = this.baseWidth / this.baseHeight,
                    minWidth = this.container.style.minWidth || 0,
                    maxWidth = this.container.style.maxWidth || 0,
                    minHeight = this.container.style.minHeight || 0;

                if(minWidth !== 0) {
                    minWidth = parseInt(minWidth.slice(0, minWidth.indexOf('px')));
                }

                if(maxWidth !== 0) {
                    maxWidth = parseInt(maxWidth.slice(0, maxWidth.indexOf('px')));
                }

                if(minHeight !== 0) {
                    minHeight = parseInt(minHeight.slice(0, minHeight.indexOf('px')));
                }

                if(clientWidth <= minWidth) {
                    clientWidth = minWidth;
                    clientHeight = clientWidth / trueAspectRatio;
                } else if(clientWidth >= maxWidth && maxWidth > 0) {
                    clientWidth = maxWidth;
                    clientHeight = clientWidth / trueAspectRatio;
                } else if(clientHeight < minHeight) {
                    clientHeight = minHeight;
                    clientWidth = clientHeight * trueAspectRatio;
                } else if(clientWidth > clientHeight) {
                    clientHeight = clientWidth / trueAspectRatio;
                    if(clientHeight > windowHeight) {
                        clientWidth = clientWidth * (windowHeight / clientHeight);
                        clientHeight = clientWidth / trueAspectRatio;
                    }

                } else {
                    clientWidth = clientHeight * trueAspectRatio;
                    if(clientWidth > windowHeight) {
                        clientHeight = clientHeight * (windowWidth / clientWidth);
                        clientWidth = clientHeight * trueAspectRatio;
                    }

                }
            }

            if (!this.supportsLiquidLayout) {
                if (this.portrait) {

                    if (this.supportsOrientationChange && this.width > this.height) {

                        this.baseWidth = this.origBaseHeight;
                        this.baseHeight = this.origBaseWidth;
                        this.width = this.origHeight;
                        this.height = this.origWidth;

                    }

                    if(this.lockAspectRatio) {

                        scaleToAspectRatio.call(this);

                    } else if (aspectRatio > 0.85) {
                        clientWidth = 0.85 * windowHeight;
                    }
                    else if (aspectRatio < 0.56) {
                        clientHeight = windowWidth / 0.56;
                    }
                }
                else {
                    // fix for a bug on iPad where bottom of screen is chopped off
                    if (Platform._isiPad && !Platform.isNativeMobile()) {
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

                    if(this.lockAspectRatio) {

                        scaleToAspectRatio.call(this);

                    } else if (aspectRatio > 0.80) {
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
                        if (Platform._isiPad && !Platform.isNativeMobile()) {
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

            var positionStatic = this.container.className == 'static';

            for (i = 0; i < this.renderer.length; i += 1) {
                this.renderer[i].view.style.width = clientWidth  + "px";
                this.renderer[i].view.style.height = clientHeight + "px";
                this.renderer[i].view.style.position = "absolute";

                if(positionStatic) {
                    //this.renderer[i].view.style.left = Math.round((this.container.clientWidth - clientWidth) / 2) + 'px';
                    this.renderer[i].view.style.left = '0px';
                    this.renderer[i].view.style.top = '0px';
                    this.container.style.height = this.renderer[i].view.style.height;

                    var menuBar = document.getElementById('menuwrapper');
                    if(typeof menuBar !== 'undefined' && menuBar !== null) {
                        menuBar.style.width = this.renderer[i].view.style.width;
                    }

                } else {
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

            }

            this.resetStage();

            if (this.supportsOrientationChange && this.currentScreen) {
                this.currentScreen.handleOrientationChange(this.portrait);
            } else if(this.currentScreen && typeof this.currentScreen.handleResize === 'function' ) {
                this.currentScreen.handleResize(this.portait);
            }

            this.refreshModal();
        }

    };

    GameUI.prototype.refreshModal = function () {

        if (this.supportsOrientationChange && this.modalStack.length > 0) {
            var modal = this.modalStack[this.modalStack.length - 1];

            this.hideModal();
            if (typeof modal.handleOrientationChange !== 'undefined') {
                modal.handleOrientationChange(this.portrait);
            }
            this.showModal(modal);
        }

    };

    GameUI.prototype.render = function() {
        this.renderer[1].render(this.stage[1]);
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
                this.frameRequest = requestAnimFrame(this._animate.bind(this)); // restart
            }
            setTimeout(watchdog, 100);
        }.bind(this);

        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
        }

        this.frameRequest = requestAnimFrame(this._animate.bind(this));
        setTimeout(watchdog, 100);

    };

    GameUI.prototype._animate = function () {
        if (Debug.enabled) {
            this.meter.tick();
        }

        this.beforeRender();
        TWEEN.update();

        this.renderer[0].render(this.stage[0]);
        if (this.refreshBackground) {
            this.refreshBackground = false;
            this.renderer[1].render(this.stage[1]);
        }

        if (this.hasModal() && this.renderer.length > 2) {
            this.renderer[2].render(this.stage[2]);
        }

        this.afterRender();
        this.lastRender = Date.now();
        this.frameRequest = requestAnimFrame(this._animate.bind(this));
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

    GameUI.prototype.showModal = function (screen, alpha, fadeIn) {
        alpha = typeof alpha === 'undefined' ? 0.5 : alpha;
        fadeIn = !!fadeIn;

        if (this.modalStack.length === 0) {

            if (!this.usingWebGL) {
                this.modalBG = this.buildModalBackground(alpha);
                if(fadeIn) {
                    this.modalBG.alpha = 0;
                    this.stage[0].addChild(this.modalBG);
                    var self = this;
                    new TWEEN.Tween({ a: 0 })
                        .to({a: 1 }, 1500)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(function () {
                            self.modalBG.alpha = this.a;
                        })
                        .onComplete(function (){
                            self.stage[0].removeChild(self.currentScreen);
                        })
                        .start();
                } else {
                    this.stage[0].removeChild(this.currentScreen);
                    this.stage[0].addChildAt(this.modalBG, 0);
                }

            }
            else {
                this.modalOverlay = this.buildModalOverlay(alpha);
                if(fadeIn) {
                    this.modalOverlay.alpha = 0;
                    var self = this;
                    new TWEEN.Tween({ a: 0 })
                        .to({a: 1 }, 1500)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(function () {
                            self.modalOverlay.alpha = this.a;
                        })
                        .start();
                }
                this.stage[0].addChildAt(this.modalOverlay, this.stage[0].children.indexOf(this.currentScreen) + 1);
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
            if (this.stage[this.DIALOG_LAYER].children.indexOf(modal) != -1) {
                this.stage[this.DIALOG_LAYER].removeChild(modal);
            }

            // restore the last modal or screen
            var l = this.modalStack.length;
            if (l === 0) {


                if (!this.usingWebGL) {
                    if (this.stage[0].children.indexOf(this.modalBG) != -1) {
                        this.stage[0].removeChild(this.modalBG);
                    }
                    this.modalBG.texture.destroy(true);
                    this.modalBG = null;
                    this.stage[0].addChildAt(this.currentScreen, 0);
                    if(Platform._isStockAndroid()) {
                        this.resetStage(800);
                    }
                } else {
                    if (this.stage[0].children.indexOf(this.modalOverlay) != -1) {
                        this.stage[0].removeChild(this.modalOverlay);
                    }
                    this.renderer[2].render(this.stage[2]); // force a render before hiding to revent old dlg from flashing on screen when we show next one
                    this.renderer[2].view.style.display = "none";
                }
            }
            else {
                var nextModal = this.modalStack[l - 1];
                this.stage[this.DIALOG_LAYER].addChild(this.modalStack[l - 1]);

                if (this.supportsOrientationChange && typeof nextModal.handleOrientationChange !== 'undefined') {
                    nextModal.handleOrientationChange(this.portrait);
                }
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
        var scale = 0.5,
            swidth = Math.ceil(this.width * scale),
            sheight = Math.ceil(this.height * scale),
            osr = this._createPIXIRenderer(swidth, sheight, false),
            graphics = new PIXI.Graphics(),
            mb,
            child,
            i;

        osr.clearBeforeRender = false;
        osr.roundPixels = true;

        graphics.beginFill(0x0, alpha);
        graphics.drawRect(0, 0, swidth, sheight);
        graphics.endFill();

        for (i = 0; i < this.stage[0].children.length; i++) {
            child = this.stage[0].getChildAt(i);
            child.scale.x = child.scale.y = scale;
        }
        this.stage[0].addChild(graphics);
        osr.render(this.stage[0]);
        this.stage[0].removeChild(graphics);

        for (i = 0; i < this.stage[0].children.length; i++) {
            child = this.stage[0].getChildAt(i);
            child.scale.x = child.scale.y = 1;
        }

        mb = new PIXI.Sprite(PIXI.Texture.fromCanvas(osr.view));
        mb.scale.x = mb.scale.y = 1/scale;

        return mb;

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
    GameUI.prototype.resetStage = function(timeout) {

        timeout = timeout !== 'undefined' ? timeout : 500;

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

        var cover = new PIXI.Graphics();
        cover.beginFill(this.backGroundColor, 1.0);
        cover.drawRect(0, 0, this.width, this.height);
        cover.endFill();

        this.stage[1].addChildAt(cover, 0);
        this.renderer[1].render(this.stage[1]);

        window.setTimeout(function() {

            try{this.stage[1].removeChildAt(0);} catch(e){}


            if(this.stage[0].children.length > 0) {
                var oldScreen = this.stage[0].getChildAt(0);
                oldScreen.visible = true;
            }

            if(this.currentScreen && this.currentScreen.background) {
                this.stage[1].addChild(this.currentScreen.background);
                this.renderer[1].render(this.stage[1]);
            }

        }.bind(this), timeout);

    };

    GameUI.prototype.showActiveAtlases = function (force) {

        force = !!force;

        if (Debug.enabled || force) {

            var activeAtlases = {},
                logger = force ? console : Debug;

            this.walkSprites(this.stage[0], function (dob) {
                if (dob instanceof PIXI.Sprite) {
                    if (dob.texture && dob.texture.baseTexture) {
                        //console.log(dob.texture.baseTexture.source.src);
                        var atlasName = dob.texture.baseTexture.source.src || "/offscreen";
                        activeAtlases[atlasName] = (activeAtlases[atlasName] || 0) + 1;
                    }
                }
            });

            logger.log("\n");
            logger.log("Active Atlases");
            logger.log("--------------");
            for (var atlas in activeAtlases) {
                if (activeAtlases.hasOwnProperty(atlas)) {
                    var shortName = atlas.substr(atlas.lastIndexOf("/") + 1);
                    logger.log(shortName + " has " + activeAtlases[atlas] + " sprites active");
                }
            }
            logger.log("--------------");
            logger.log("There are " + _.size(PIXI.BaseTextureCache) +  " textures in the PIXI.BaseTextureCache.");
            logger.log("There are " + _.size(PIXI.TextureCache) +  " textures in the PIXI.TextureCache.");
            logger.log("-------------- \n");

        }
    };

    // walk the sprites in a graph an perform operation
    GameUI.prototype.walkSprites = function (dob, operation) {

        operation(dob);

        for (var c = 0; c < dob.children.length; c += 1) {
            this.walkSprites(dob.children[c], operation);
        }
    };

    GameUI.prototype.handleCommand = function (command) {

    };

    return GameUI;
});
