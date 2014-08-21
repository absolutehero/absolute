/**
 * This is a dumping ground for browser fixes and shims.
 */
define(['pixi'], function(PIXI) {

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

    // patch PIXI json loader to support IE10 (this kills support for IE8 which didn't work anyway
    PIXI.JsonLoader.prototype.load = function () {

        this.ajaxRequest = new window.XMLHttpRequest();

        var scope = this;

        this.ajaxRequest.onload = function () {
            scope.onJSONLoaded();
        };

        this.ajaxRequest.open('GET',this.url,false);
        this.ajaxRequest.send();
    };

    // touch move broken in 1.5.3
    if(PIXI.VERSION = "v1.5.3") {

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
                console.log('Destroy atlas texture.');
                delete PIXI.BaseTextureCache[this.imageUrl];
                this.imageUrl = null;
                this.source.src = null;
            }
            else if (this.source && this.source._pixiId)
            {
                console.log('Destroy canvas texture.');
                delete PIXI.BaseTextureCache[this.source._pixiId];
            }
            else
            {
                console.log('Cannot destroy canvas texture.');
            }

            this.source = null;
            PIXI.texturesToDestroy.push(this);
        };

    }


});