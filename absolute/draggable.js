/**
 * Created by craig on 10/10/13.
 */

define(['pixi', 'absolute/platform'], function (PIXI, Platform) {

    var Draggable = function(image, limit, onGrab, onMove, onDrop) {
        this._initDraggable(image, limit, onGrab, onMove, onDrop);
    };

    Draggable.constructor = Draggable;
    Draggable.prototype = Object.create(PIXI.Sprite.prototype);

    Draggable.prototype._initDraggable = function(image, limit, onGrab, onMove, onDrop) {
        PIXI.Sprite.call(this, image);

        this.limit = limit;
        this.onGrab = onGrab;
        this.onMove = onMove;
        this.onDrop = onDrop;
        this.anchor.x = this.anchor.y = 0.5;
        this.interactive = true;
        //this.buttonMode = true;
        this.data = null;
        this.dragging = false;
        this.lastPos = null;

        var start = function (data) {
            // stop the default event...
            data.originalEvent.preventDefault();

            // store a reference to the data
            // The reason for this is because of multitouch
            // we want to track the movement of this particular touch
            this.data = data;
            this.alpha = 0.8;
            this.dragging = true;

            if (typeof this.onGrab === "function") {
                this.onGrab(this);
            }

        }.bind(this);

        var end = function(data)
        {
            this.alpha = 1;
            this.dragging = false;
            // set the interaction data to null
            this.data = null;

            if (typeof this.onDrop === "function") {
                this.onDrop(this);
            }

        }.bind(this);

        var move = function(data)
        {
            if(this.dragging)
            {
                // need to get parent coords..
                var newPosition = this.data.getLocalPosition(this.parent);

                if (newPosition.x > limit.x && newPosition.x < (limit.x + limit.width) &&
                    newPosition.y > limit.y && newPosition.y < (limit.y + limit.height)) {
                    this.position.x = newPosition.x;
                    this.position.y = newPosition.y;

                    if (typeof this.onMove === "function") {
                        this.onMove(this);
                    }
                }
            }
        }.bind(this);

        if (Platform.supportsTouch()) {
            this.touchstart = start;
            this.touchend = this.touchendoutside = end;
            this.touchmove = move;
        }
        else {
            this.mousedown = start;
            this.mouseup = this.mouseupoutside = end;
            this.mousemove = move;
        }

    };

    return Draggable;

});