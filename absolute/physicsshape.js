/**
 * User: craig
 * Date: 3/11/14
 * Time: 5:11 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi','box2d', 'absolute/physics', 'absolute/screenmetrics'], function (PIXI, Box2D, Physics, ScreenMetrics) {

    var PhysicsShape = function(id, config) {
        this._initPhysicsShape(id, config);
    };

    PhysicsShape.constructor = PhysicsShape;
    PhysicsShape.prototype = Object.create(PIXI.Sprite.prototype);

    PhysicsShape.prototype._initPhysicsShape = function(id, config) {
        var textureName = id + '.png';
        PIXI.Sprite.call(this, PIXI.Texture.fromFrame(textureName));
        this.config = config;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        //this.scale.x = 1;
        //this.scale.y = -1;
        //this.pivot.x = 0.5;//this.width / 2;
        //this.pivot.y = 0.5;//this.height / 2;

        this.collided = false;

        this.setInteractive(true);
        this.buttonMode = true;

        this.dragging = false;

        this.mousedown = this.touchstart = function (data) {
            data.originalEvent.preventDefault();

            this.dragging = true;
            if (!this.body) {
                this.letsGetPhysical();
            }
            Physics.startMouseJoint(new PIXI.Point(Physics.screenToWorldX(data.global.x), Physics.screenToWorldY(data.global.y)));
        };

        this.mousemove = this.touchmove = function (data) {
            if (this.dragging) {
                data.originalEvent.preventDefault();
                Physics.moveMouseJoint(new PIXI.Point(Physics.screenToWorldX(data.global.x), Physics.screenToWorldY(data.global.y)));
            }
        };

        this.mouseup = this.mouseupoutside = this.touchend = function (data) {
            if (this.dragging){
                data.originalEvent.preventDefault();
                Physics.stopMouseJoint();
            }
        };

        this.attachments = [];
    };

    PhysicsShape.prototype.addAttachment = function (fixture) {
        this.attachments.push(fixture);
    };

    PhysicsShape.prototype.isAttached = function (fixture) {
        return this.attachments.indexOf(fixture) !== -1;
    };

    PhysicsShape.prototype.letsGetPhysical = function (skipShapeBuilding, isSensor) {
        if (this.body) {
            return;
        }

        var bd = new Box2D.b2BodyDef();
        if(isSensor) {
            bd.set_type(Box2D.b2_kinematicBody);
        } else {
            bd.set_type(Box2D.b2_dynamicBody);
        }

        bd.set_position(new Box2D.b2Vec2(0, 0));

        this.body = Physics.world.CreateBody(bd);

        if(skipShapeBuilding) {

            //var fixture = Box2D.CreateFixture(this.config, 2);
            var fixture = new Box2D.b2FixtureDef();

            fixture.set_density(2);
            fixture.set_friction(1);
            fixture.set_restitution(0);
            fixture.set_shape(this.config); // this.config needs to be a box2d shape object

            if(isSensor) {
                fixture.set_isSensor(isSensor);
            }

            this.body.CreateFixture(fixture);

        } else {
            for (var s = 0; s < this.config.length; s += 1) {
                var fixture = new Box2D.b2FixtureDef();
                fixture.set_shape(this.buildShapeFromVertices(this.config[s].shape));
                fixture.set_density(this.config[s].density);
                fixture.set_friction(this.config[s].friction);
                fixture.set_restitution(this.config[s].bounce);

                this.body.CreateFixture(fixture);
            }
        }



        var temp = new Box2D.b2Vec2(0, 0);
        temp.Set(Physics.screenToWorldX(this.position.x), Physics.screenToWorldY(this.position.y));
        this.body.SetTransform(temp, -this.rotation);

        this.body.SetAwake(1);
        //this.body.SetActive(1);
        this.body.userData = this;

    };

    PhysicsShape.prototype.setActive = function (active) {
        return this.body ? this.body.SetActive(active ? 1 : 0) : false;
    };

    PhysicsShape.prototype.isActive = function () {
        return this.body ? this.body.IsActive() : false;
    };

    PhysicsShape.prototype.buildShapeFromVertices = function (vertices) {
        var shape = new Box2D.b2PolygonShape();
        var buffer = Box2D.allocate(vertices.length * 4, 'float', Box2D.ALLOC_STACK);
        var offset = 0;
        for (var i = 0; i < vertices.length; i += 2) {
            //console.log("Adding vertex at (" + vertices[i] / Physics.pixelsPerMeter + ", " + vertices[i + 1] / Physics.pixelsPerMeter  + ")");
            Box2D.setValue(buffer+(offset),   (ScreenMetrics.getResScale() * vertices[i] - this.width / 2) / Physics.pixelsPerMeter, 'float'); // x
            Box2D.setValue(buffer+(offset+4), (ScreenMetrics.getResScale() * vertices[i + 1] - this.height / 2) / Physics.pixelsPerMeter, 'float'); // y
            offset += 8;
        }
        var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
        shape.Set(ptr_wrapped, vertices.length / 2);

        return shape;
    };

    PhysicsShape.prototype.update = function () {
        if (this.body) {
            var pos = this.body.GetPosition();
            var angle = this.body.GetAngle();

            this.position.x = Physics.worldToScreenX(pos.get_x());
            this.position.y = Physics.worldToScreenY(pos.get_y());
            this.rotation = -angle;
        }
    };

    PhysicsShape.prototype.setX = function (x) {
        x = Math.floor(x);
        if (this.body) {
            var xform = this.body.GetTransform();
            this.body.SetTransform(new Box2D.b2Vec2(Physics.screenToWorldX(x), xform.get_p().get_y()), xform.get_q());
        }
        this.position.x = x;
    };

    PhysicsShape.prototype.setY = function (y) {
        y = Math.floor(y);
        if (this.body) {
            var xform = this.body.GetTransform();
            this.body.SetTransform(new Box2D.b2Vec2(xform.get_p().get_x(), Physics.screenToWorldY(y)), xform.get_q());
        }
        this.position.y = y;
    };

    PhysicsShape.prototype.setRotation = function (r) {
        if (this.body) {
            var xform = this.body.GetTransform();
            this.body.SetTransform(xform.get_p(), -r);
        }
        this.rotation = r;
    };

    PhysicsShape.prototype.getTop = function () {
        return this.body.GetFixtureList().GetAABB().get_upperBound().get_y();
    };

    PhysicsShape.prototype.getBottom = function () {
        return this.body.GetFixtureList().GetAABB().get_lowerBound().get_y();
    };

    PhysicsShape.prototype.hasCollided = function () {
        if (!this.collided) {
            this.collided = (this.body.GetContactList().a !== 0);
            // just collided - callback?
        }
        return this.collided;
    };


    return PhysicsShape;
});