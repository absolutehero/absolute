/**
 * This is a dumping ground for browser fixes and shims.
 */
define(['pixi','absolute/platform'], function(PIXI, Platform) {

    // Some versions of V8 on ARM (like the one in the stock Android 4 browser) are affected by
    // this nasty bug: https://code.google.com/p/v8/issues/detail?id=2234
    //
    // So, hack around it. This doesn't affect Android 2. Hopefully 5 will use an updated V8
    // with the real fix.

    if (window.navigator.userAgent.indexOf("Linux; U; Android 4") >= 0) {

        var sin = Math.sin, cos = Math.cos;
        Math.sin = function (x) {
            return (x == 0) ? 0 : sin(x);
        };
        Math.cos = function (x) {
            return (x == 0) ? 1 : cos(x);
        }
    }

    // patch for Date.now() on older browsers
    if (!Date.now) {
        Date.now = function now() {
            return +(new Date);
        };
    }

    var pixiMajorVersion = parseInt(PIXI.VERSION.slice(1,PIXI.VERSION.indexOf('.')));

    // patch PIXI json loader to support IE10 (this kills support for IE8 which didn't work anyway
    if (PIXI.JsonLoader) {
        PIXI.JsonLoader.prototype.load = function () {

            this.ajaxRequest = new window.XMLHttpRequest();

            var scope = this;

            this.ajaxRequest.onload = function () {
                try {
                    scope.onJSONLoaded();
                }
                catch (e) {
                    scope.onError();
                }
            };

            this.ajaxRequest.onerror = function () {
                scope.onError();
            }

            this.ajaxRequest.open('GET', this.url, true);
            this.ajaxRequest.send();
        };
    }
    if(pixiMajorVersion < 3) {

        /**
         * Description:
         * Overriding pixi's mouse up function because it tries to access interaction items after they have been removed
         * from memory. Render loop timing issue. So now we skip items if they are undefined.
         *
         * Fixed in pixi v3
         *
         * @param event
         */
        PIXI.InteractionManager.prototype.onMouseUp = function(event)
        {
            if (this.dirty)
            {
                this.rebuildInteractiveGraph();
            }

            this.mouse.originalEvent = event;

            var length = this.interactiveItems.length;
            var up = false;

            var e = this.mouse.originalEvent;
            var isRightButton = e.button === 2 || e.which === 3;

            var upFunction = isRightButton ? 'rightup' : 'mouseup';
            var clickFunction = isRightButton ? 'rightclick' : 'click';
            var upOutsideFunction = isRightButton ? 'rightupoutside' : 'mouseupoutside';
            var isDown = isRightButton ? '__isRightDown' : '__isDown';

            for (var i = 0; i < length; i++)
            {
                var item = this.interactiveItems[i];

                if(typeof item === 'undefined' || item === null) {
                    continue;
                }

                if (item[clickFunction] || item[upFunction] || item[upOutsideFunction])
                {
                    item.__hit = this.hitTest(item, this.mouse);

                    if (item.__hit && !up)
                    {
                        //call the function!
                        if (item[upFunction])
                        {
                            item[upFunction](this.mouse);
                        }
                        if (item[isDown])
                        {
                            if (item[clickFunction])
                            {
                                item[clickFunction](this.mouse);
                            }
                        }

                        if (!item.interactiveChildren)
                        {
                            up = true;
                        }
                    }
                    else
                    {
                        if (item[isDown])
                        {
                            if (item[upOutsideFunction]) item[upOutsideFunction](this.mouse);
                        }
                    }

                    item[isDown] = false;
                }
            }
        };
    }


    // touch move broken in 1.5.3
    if(PIXI.VERSION == "v1.5.3") {

        PIXI.InteractionManager.prototype.onTouchMove = function(event)
        {
            var rect = this.interactionDOMElement.getBoundingClientRect();
            var changedTouches = event.changedTouches;
            var touchData;
            var i = 0;



            for (i = 0; i < changedTouches.length; i++)
            {
                var touchEvent = changedTouches[i];
                touchData = this.touchs[touchEvent.identifier];
                touchData.originalEvent =  event || window.event;

                // update the touch position
                touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
                touchData.global.y = (touchEvent.clientY - rect.top)  * (this.target.height / rect.height);
                if(navigator.isCocoonJS) {
                    touchData.global.x = touchEvent.clientX;
                    touchData.global.y = touchEvent.clientY;
                }

                for (var j = 0; j < this.interactiveItems.length; j++)
                {
                    var item = this.interactiveItems[j];

                    // this is the line that is broken in 1.5.3
                    //if(item.touchmove && item.__touchData[touchEvent.identifier]) item.touchmove(touchData);
                    if(item.touchmove && item.__touchData && item.__touchData[touchEvent.identifier]) item.touchmove(touchData);
                }
            }
        };

        PIXI.Text.prototype.destroy = function(destroyBaseTexture)
        {
            this.texture.destroy(destroyBaseTexture);
        };

        PIXI.BaseTexture.prototype.destroy = function()
        {
            if(this.imageUrl)
            {
                delete PIXI.BaseTextureCache[this.imageUrl];
                this.imageUrl = null;
                this.source.src = null;
            }
            else if (this.source && this.source._pixiId)
            {
                delete PIXI.BaseTextureCache[this.source._pixiId];
            }

            this.source = null;
            if (PIXI.texturesToDestroy) {
                PIXI.texturesToDestroy.push(this);
            }
        };
    }

    PIXI.AjaxRequest = function()
    {
        var activexmodes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP']; //activeX versions to check for in IE

        if (window.XMLHttpRequest) // if Mozilla, Safari etc
        {
            return new window.XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
            for (var i=0; i<activexmodes.length; i++)
            {
                try{
                    return new window.ActiveXObject(activexmodes[i]);
                }
                catch(e) {
                    //suppress error
                }
            }
        } else
        {
            return false;
        }
    };

    if(Platform.hasPutImageDataBug()) {

        PIXI.CanvasTinter.tintWithPerPixel = function(texture, color, canvas)
        {
            var context = canvas.getContext( "2d" );

            var frame = texture.frame;

            canvas.width = frame.width;
            canvas.height = frame.height;

            context.globalCompositeOperation = "copy";
            context.drawImage(texture.baseTexture.source,
                frame.x,
                frame.y,
                frame.width,
                frame.height,
                0,
                0,
                frame.width,
                frame.height);

            var rgbValues = PIXI.hex2rgb(color);
            var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];

            var pixelData = context.getImageData(0, 0, frame.width, frame.height);

            var pixels = pixelData.data;

            for (var i = 0; i < pixels.length; i += 4)
            {
                pixels[i+0] *= r;
                pixels[i+1] *= g;
                pixels[i+2] *= b;

                // START PATCH
                // apply a fix for android native browser bug
                var alpha = pixels[i+3];
                pixels[i] /= 255/alpha;
                pixels[i+1] /= 255/alpha;
                pixels[i+2] /= 255/alpha;
                // END PATCH

            }

            context.putImageData(pixelData, 0, 0);
        };

        PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithPerPixel;



    }

    Object.defineProperty(PIXI.Point.prototype, "X", {
        get: function () {
            throw "PIXI.Point has no member X";
        },
        set: function (value) {
            throw "PIXI.Point has no member X";
        }
    });

    Object.defineProperty(PIXI.Point.prototype, "Y", {
        get: function () {
            throw "PIXI.Point has no member Y";
        },
        set: function (value) {
            throw "PIXI.Point has no member Y";
        }
    });



});