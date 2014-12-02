/**
 * User: craig
 * Date: 3/26/14
 * Time: 10:17 AM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'absolute/platform'], function (PIXI, Platform) {


    var ScrollArea = function(width, height, constraints, scrollArrowTexture, moveCompleteCallback) {
        this._initScrollArea(width, height, constraints, scrollArrowTexture, moveCompleteCallback);
    };

    ScrollArea.constructor = ScrollArea;
    ScrollArea.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    ScrollArea.prototype._initScrollArea = function(width, height, constraints, scrollArrowTexture, moveCompleteCallback) {
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

        if (scrollArrowTexture) {
            this.scrollArrow = new PIXI.Sprite(scrollArrowTexture);
            this.scrollArrow.anchor.x = this.scrollArrow.anchor.y = 0.5;
        }

        this.moveCompleteCallback = moveCompleteCallback;

        this.moving = false;

        this.contents = new PIXI.DisplayObjectContainer();
        this.contents.interactive = true;

        if (Platform.supportsTouch()) {
            this.contents.touchstart = this.onMoveStart.bind(this);
            this.contents.touchmove = this.onMove.bind(this);
            this.contents.touchend = this.onMoveEnd.bind(this);
        }
        else {
            this.contents.mousedown = this.onMoveStart.bind(this);
            this.contents.mousemove = this.onMove.bind(this);
            this.contents.mouseup = this.onMoveEnd.bind(this);
            this.contents.mouseupoutside = this.onMoveEnd.bind(this);
        }
        this.addChild(this.contents);

        this.resize(width, height);
    };

    ScrollArea.prototype.resize = function (width, height) {
        this.width_ = width;
        this.height_ = height;


        if (this.mask) {
            this.removeChild(this.mask);
        }
        var mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF, 1.0);
        mask.drawRect(0, 0, this.width_, this.height_);
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
            if (xp <= 0 && xp >= this.width_ - this.contents.width) {
                this.contents.position.x = Math.round(xp);
            }
        }
    };

    ScrollArea.prototype.scrollYAbsolute = function (yp) {
        if (!this.constrainY) {
            if (yp <= 0 && yp >= this.height_ - this.contents.height) {
                this.contents.position.y =  Math.round(yp);
            }
        }
    };

    ScrollArea.prototype.scrollX = function (deltaX) {
        if (!this.constrainX) {
            var xp = this.contents.position.x + deltaX;
            if (xp <= 0 && xp >= this.width_ - this.contents.width) {
                this.contents.position.x = Math.round(xp);
            }
        }
    };

    ScrollArea.prototype.scrollY = function (deltaY) {
        if (!this.constrainY) {
            var yp = this.contents.position.y + deltaY;
            if (yp <= 0 && yp >= this.height_ - this.contents.height) {
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
            this.contents.position.y = this.height_ - this.contents.height;
        }
    };

    ScrollArea.prototype.scrollLeft = function () {
        if (!this.constrainX) {
            this.contents.position.x = 0;
        }
    };

    ScrollArea.prototype.scrollRight = function () {
        if (!this.constrainX) {
            this.contents.position.x = this.width_ - this.contents.width;
        }
    };

    ScrollArea.prototype.updateContentBounds = function () {

        if (this.contents.width && this.contents.height) {
            this.contents.hitArea = new PIXI.Rectangle(0, 0, this.contents.width, this.contents.height);
        }
        else {
            var bb;
            bb = this.computeAABB(this.contents);
            this.contents.width_ = bb.width;
            this.contents.height_ = bb.height;

            this.contents.hitArea = new PIXI.Rectangle(0, 0, bb.width_, bb.height_);
        }


        if (this.constrainX) {
            switch (this.constrainXType) {
                case "left":
                    this.contents.position.x = 0;
                    break;
                case "right":
                    this.contents.position.x = this.width_ - this.contents.width;
                    break;
                case "center":
                    this.contents.position.x = (this.width_ - this.contents.width) / 2;
                    break;
            }
        }

        if (this.constrainY) {
            switch (this.constrainYType) {
                case "top":
                    this.contents.position.y = 0;
                    break;
                case "bottom":
                    this.contents.position.y = this.height_ - this.contents.height;
                    break;
                case "center":
                    this.contents.position.y = (this.height_ - this.contents.height) / 2;
                    break;
            }
        }
    };

    ScrollArea.prototype.computeAABB = function (dob) {
        if (dob instanceof PIXI.Sprite) {
            return new PIXI.Rectangle(dob.position.x, dob.position.y, dob.width, dob.height);
        }
        else if (dob instanceof PIXI.DisplayObjectContainer) {

            // if a container has a width and height set, use those rather than computing
            if (dob.width_ && dob.height_) {
                return new PIXI.Rectangle(dob.position.x, dob.position.y, dob.width_, dob.height_);
            }
            else if (dob.width && dob.height) {
                return new PIXI.Rectangle(dob.position.x, dob.position.y, dob.width, dob.height);
            }
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

        if (this.scrollArrow) {
            this.addChild(this.scrollArrow);
            this.scrollArrow.position.x = pos.x;
            this.scrollArrow.position.y = pos.y;
            this.scrollArrow.anchor.x = this.scrollArrow.anchor.y = 0.5;
            this.scrollArrow.visible = false;
        }

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

            if (this.scrollArrow) {
                if (!this.scrollArrow.visible) {
                    this.scrollArrow.visible = true;
                }
                if (!this.constrainX) {
                    this.scrollArrow.position.x = pos.x;
                }
                if (!this.constrainY) {
                    this.scrollArrow.position.y = pos.y;
                }
            }
        }
    };

    ScrollArea.prototype.onMoveEnd = function (data) {
        this.moving = false;
        var pos = data.getLocalPosition(this.parent);
        var newX = pos.x;
        var newY = pos.y;
        var deltaX = newX - this.startX;
        var deltaY = newY - this.startY;

        if (this.scrollArrow) {
            this.removeChild(this.scrollArrow);
        }

        if (this.moveCompleteCallback) {
            this.moveCompleteCallback();
        }
    };

    /**
     * Returns true if any part of the child is visible within the clipping area.
     * @param child
     */
    ScrollArea.prototype.isChildVisible = function (child) {
        this.contents.updateTransform();
        var childRect = new PIXI.Rectangle(child.worldTransform.tx, child.worldTransform.ty, child.width_, child.height_);
        var parentRect = new PIXI.Rectangle(this.worldTransform.tx, this.worldTransform.ty, this.width_, this.height_);

        var a = parentRect.contains(childRect.x + childRect.width / 2, childRect.y + childRect.height / 2),
            b = parentRect.contains(childRect.x, childRect.y),
            c = parentRect.contains(childRect.x + childRect.width, childRect.y),
            d = parentRect.contains(childRect.x + childRect.width, childRect.y + childRect.height),
            e = parentRect.contains(childRect.x + childRect.width, childRect.y + childRect.height);

        return a || b || c || d || e;
    };


    return ScrollArea;
});