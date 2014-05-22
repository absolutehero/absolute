/**
 * User: craig
 * Date: 3/26/14
 * Time: 10:17 AM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'absolute/platform'], function (PIXI, Platform) {


    var ScrollArea = function(width, height, constraints) {
        this._initScrollArea(width, height, constraints);
    };

    ScrollArea.constructor = ScrollArea;
    ScrollArea.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    ScrollArea.prototype._initScrollArea = function(width, height, constraints) {
        PIXI.DisplayObjectContainer.call(this);

        if (constraints) {
            if (constraints.x) {
                this.constrainX = true;
                this.constrainXType = constraints.x;
            }
            else if (constraints.y) {
                this.constrainY = true;
                this.constrainYType = constraints.y;
            }
            else {
                this.constrainX = this.constrainY = false;
            }
        }

        this.moving = false;

        this.contents = new PIXI.DisplayObjectContainer();
        this.contents.setInteractive(true);

        if (Platform.supportsTouch()) {
            this.contents.touchstart = this.onMoveStart.bind(this);
            this.contents.touchmove = this.onMove.bind(this);
            this.contents.touchend = this.onMoveEnd.bind(this);
        }
        else {
            this.contents.mousedown = this.onMoveStart.bind(this);
            this.contents.mousemove = this.onMove.bind(this);
            this.contents.mouseup = this.onMoveEnd.bind(this);
        }
        this.addChild(this.contents);

        this.resize(width, height);
    };

    ScrollArea.prototype.resize = function (width, height) {
        this.width = width;
        this.height = height;

        if (this.mask) {
            this.removeChild(this.mask);
        }
        var mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF, 1.0);
        mask.drawRect(0, 0, this.width, this.height);
        mask.endFill();
        this.mask = mask;
        this.addChild(this.mask);

        this.updateContentBounds();
    };

    ScrollArea.prototype.addItem = function (dob) {
        this.contents.addChild(dob);
        this.updateContentBounds();
    };

    ScrollArea.prototype.scrollXAbsolute = function (xp) {
        if (!this.constrainX) {
            if (xp <= 0 && xp >= this.width - this.contents.width) {
                this.contents.position.x = Math.round(xp);
            }
        }
    };

    ScrollArea.prototype.scrollYAbsolute = function (yp) {
        if (!this.constrainY) {
            if (yp <= 0 && yp >= this.height - this.contents.height) {
                this.contents.position.y =  Math.round(yp);
            }
        }
    };

    ScrollArea.prototype.scrollX = function (deltaX) {
        if (!this.constrainX) {
            var xp = this.contents.position.x + deltaX;
            if (xp <= 0 && xp >= this.width - this.contents.width) {
                this.contents.position.x = Math.round(xp);
            }
        }
    };

    ScrollArea.prototype.scrollY = function (deltaY) {
        if (!this.constrainY) {
            var yp = this.contents.position.y + deltaY;
            if (yp <= 0 && yp >= this.height - this.contents.height) {
                this.contents.position.y =  Math.round(yp);
            }
        }
    };

    ScrollArea.prototype.scrollTop = function () {
        if (!this.constrainY) {
            this.contents.position.y = 0;
        }
    };

    ScrollArea.prototype.scrollBottom = function () {
        if (!this.constrainY) {
            this.contents.position.y = this.height - this.contents.height;
        }
    };

    ScrollArea.prototype.scrollLeft = function () {
        if (!this.constrainY) {
            this.contents.position.x = 0;
        }
    };

    ScrollArea.prototype.scrollRight = function () {
        if (!this.constrainY) {
            this.contents.position.x = this.width - this.contents.width;
        }
    };

    ScrollArea.prototype.updateContentBounds = function () {
        var bb;

        bb = this.computeAABB(this.contents);

        this.contents.width = bb.width;
        this.contents.height = bb.height;

        this.contents.hitArea = new PIXI.Rectangle(0, 0, bb.width, bb.height);

        if (this.constrainX) {
            switch (this.constrainXType) {
                case "left":
                    this.contents.position.x = 0;
                    break;
                case "right":
                    this.contents.position.x = this.width - this.contents.width;
                    break;
                case "center":
                    this.contents.position.x = (this.width - this.contents.width) / 2;
                    break;
            }
        }

        if (this.constrainY) {
            switch (this.constrainYType) {
                case "top":
                    this.contents.position.y = 0;
                    break;
                case "bottom":
                    this.contents.position.y = this.height - this.contents.height;
                    break;
                case "center":
                    this.contents.position.y = (this.height - this.contents.height) / 2;
                    break;
            }
        }
    };

    ScrollArea.prototype.computeAABB = function (dob) {
        if (dob instanceof PIXI.Sprite) {
            return new PIXI.Rectangle(dob.position.x, dob.position.y, dob.width, dob.height);
        }
        else if (dob instanceof PIXI.DisplayObjectContainer) {

            if (dob.children.length > 0) {

                var minX = Number.MAX_VALUE,
                    maxX = Number.MIN_VALUE,
                    minY = Number.MAX_VALUE,
                    maxY = Number.MIN_VALUE;

                for (var c = 0; c < dob.children.length; c += 1) {
                    var cAABB = this.computeAABB(dob.children[c]);

                    if (cAABB.x < minX) {
                        minX = cAABB.x;
                    }

                    if (cAABB.y < minY) {
                        minY = cAABB.y;
                    }

                    if (cAABB.x + cAABB.width > maxX) {
                        maxX = cAABB.x + cAABB.width;
                    }

                    if (cAABB.y + cAABB.height > maxY) {
                        maxY = cAABB.y + cAABB.height;
                    }
                }

                minX *= dob.scale.x;
                maxX *= dob.scale.x;
                minY *= dob.scale.y;
                maxY *= dob.scale.y;

                return new PIXI.Rectangle(dob.position.x + minX, dob.position.y + minY, maxX - minX, maxY - minY);
            }
            else {
                return new PIXI.Rectangle(dob.position.x, dob.position.y, 0, 0);
            }
        }
    };

    ScrollArea.prototype.onMoveStart = function (data) {
        this.moving = true;
        data.originalEvent.preventDefault();
        var pos = data.getLocalPosition(this.parent);
        this.lastX = pos.x;
        this.lastY = pos.y;
        this.startX = pos.x;
        this.startY = pos.y;
    };

    ScrollArea.prototype.onMove = function (data) {
        if (this.moving) {
            var pos = data.getLocalPosition(this.parent);
            var newX = pos.x;
            var newY = pos.y;
            var deltaX = newX - this.lastX;
            var deltaY = newY - this.lastY;

            this.lastX = newX;
            this.lastY = newY;

            this.scrollY(deltaY);
            this.scrollX(deltaX);
        }
    };

    ScrollArea.prototype.onMoveEnd = function (data) {
        this.moving = false;
        var pos = data.getLocalPosition(this.parent);
        var newX = pos.x;
        var newY = pos.y;
        var deltaX = newX - this.startX;
        var deltaY = newY - this.startY;
    };


    return ScrollArea;
});