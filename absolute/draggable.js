/**
 * Created by craig on 10/10/13.
 */

define(['pixi', 'absolute/platform'], function (PIXI, Platform) {

    var Draggable = function(child, limit, onGrab, onMove, onDrop) {
        this._initDraggable(child, limit, onGrab, onMove, onDrop);
    };

    Draggable.constructor = Draggable;
    Draggable.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    Draggable.prototype._initDraggable = function(child, limit, onGrab, onMove, onDrop) {
        PIXI.DisplayObjectContainer.call(this);

        this.addChild(child);

        this.limit = limit || new PIXI.Rectangle(0, 0, 0, 0);;
        this.onGrab = onGrab;
        this.onMove = onMove;
        this.onDrop = onDrop;
        this.interactive = true;
        this.data = null;
        this.dragging = false;

        if (Platform.supportsTouch()) {
            this.touchstart = this._onGrab;
            this.touchend = this.touchendoutside = this._onDrop;
            this.touchmove = this._onMove;
        }
        else {
            this.mousedown = this._onGrab;
            this.mouseup = this.mouseupoutside = this._onDrop;
            this.mousemove = this._onMove;
        }

    };

    Draggable.prototype._onGrab = function (data) {
        data.originalEvent.preventDefault();

        this.data = data;
        this.alpha = 0.8;
        this.dragging = true;

        if (typeof this.onGrab === "function") {
            this.onGrab(this);
        }
    };

    Draggable.prototype._onDrop = function(data)
    {
        this.alpha = 1;
        this.dragging = false;
        this.data = null;

        if (typeof this.onDrop === "function") {
            this.onDrop(this);
        }

    };

    Draggable.prototype._onMove = function(data)
    {
        if(this.dragging)
        {
            var newPosition = this.data.getLocalPosition(this.parent);

            if (this.limit) {
                if (newPosition.x > this.limit.x && newPosition.x < (this.limit.x + this.limit.width) &&
                    newPosition.y > this.limit.y && newPosition.y < (this.limit.y + this.limit.height)) {
                    this.position.x = Math.round(newPosition.x);
                    this.position.y = Math.round(newPosition.y);
                }
            }

            if (typeof this.onMove === "function") {
                this.onMove(this);
            }
        }
    };

    return Draggable;

});