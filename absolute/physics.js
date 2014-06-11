/**
 * User: craig
 * Date: 3/11/14
 * Time: 3:37 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['box2d', 'absolute/screenmetrics'], function (Box2D, ScreenMetrics) {

    var Physics = {

        world: null,

        pixelsPerMeter: 0,

        ZERO: null,

        debugRenderer: null,

        init: function (ui, gravityX, gravityY, worldOffset, pixelsPerMeter) {
            this.ZERO = new Box2D.b2Vec2(0, 0);

            this.pixelsPerMeter = pixelsPerMeter * ScreenMetrics.getResScale();

            this.renderContext = ui.renderer[0].context;
            this.renderCanvas = ui.renderer[0].view;

            this.debugRenderer = this.getCanvasDebugDraw();
            this.debugRenderer.SetFlags(this.e_shapeBit | this.e_jointBit);
            //this.debugRenderer.SetFlags(this.e_jointBit);
            //this.debugRenderer.SetFlags(this.e_aabbBit);

            if ( this.world != null )
                Box2D.destroy(this.world);

            this.world = new Box2D.b2World( new Box2D.b2Vec2(gravityX, gravityY) );
            this.world.SetDebugDraw(this.debugRenderer);

            this.setWorldXOffset(worldOffset.x);
            this.setWorldYOffset(worldOffset.y);

            //this.contactListener = new Box2D.b2ContactListener();

            var self = this;
/*
            Box2D.customizeVTable(this.contactListener, [{
                original: Box2D.b2ContactListener.prototype.BeginContact,
                replacement:
                    function (thsPtr, contactPtr) {
                        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
                        var fixtureA = contact.GetFixtureA();
                        var fixtureB = contact.GetFixtureB();
                        var bodyA = fixtureA.GetBody();
                        var bodyB = fixtureB.GetBody();
                        var psA = bodyA.userData;
                        var psB = bodyB.userData;

                        if (psA && psB && !(psA.isAttached(bodyB) || psB.isAttached(bodyA))) {

                            psA.addAttachment(bodyB);
                            psB.addAttachment(bodyA);

                            setTimeout (function () {
                                if (bodyA !== self.groundBody && bodyB !== self.groundBody) {
                                    var jointDef = new Box2D.b2FrictionJointDef();
                                    //jointDef.Initialize(bodyA, bodyB);
                                    jointDef.set_bodyA( bodyA );
                                    jointDef.set_bodyB( bodyB );
                                    //jointDef.set_localAnchorA( bodyA.GetWorldCenter() );
                                    //jointDef.set_localAnchorB( bodyB.GetWorldCenter() );
                                    jointDef.set_collideConnected( true );
                                    jointDef.set_maxForce(1500);
                                    jointDef.set_maxTorque(1300);
                                    //jointDef.set_frequencyHz(20);
                                    //jointDef.set_dampingRatio(0.9);
                                    var joint = Box2D.castObject( self.world.CreateJoint( jointDef ), Box2D.b2DistanceJoint );

                                    console.log('created joint');
                                }

                            }, 10);

                        }
                    }
            }]);
 */
            //this.world.SetContactListener( this.contactListener );

            this.myQueryCallback = new Box2D.b2QueryCallback();

            Box2D.customizeVTable(this.myQueryCallback, [{
                original: Box2D.b2QueryCallback.prototype.ReportFixture,
                replacement:
                    function(thsPtr, fixturePtr) {
                        var ths = Box2D.wrapPointer( thsPtr, Box2D.b2QueryCallback );
                        var fixture = Box2D.wrapPointer( fixturePtr, Box2D.b2Fixture );
                        if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
                            return true;
                        if ( ! fixture.TestPoint( ths.m_point ) )
                            return true;
                        ths.m_fixture = fixture;
                        return false;
                    }
            }]);

            this.mouseJointGroundBody = this.world.CreateBody( new Box2D.b2BodyDef() );

        },

        setPixelsPerMeter: function (pixelsPerMeter) {
            this.pixelsPerMeter = pixelsPerMeter * ScreenMetrics.getResScale();
        },

        buildGround: function (start, end) {
            var bd_ground = new Box2D.b2BodyDef();
            this.groundBody = this.world.CreateBody(bd_ground);
            //ground edges
            var shape0 = new Box2D.b2EdgeShape();
            shape0.Set(new Box2D.b2Vec2(start.x, start.y), new Box2D.b2Vec2(end.x, end.y));
            var fixture = new Box2D.b2FixtureDef();
            fixture.set_shape(shape0);
            fixture.set_density(1);
            fixture.set_friction(1);
            fixture.set_restitution(0);
            this.groundBody.CreateFixture(fixture);
        },

        startMouseJoint: function(mousePosWorld) {

            if ( this.mouseJoint != null )
                return;

            // Make a small box.
            var aabb = new Box2D.b2AABB();
            var d = 0.001;
            aabb.set_lowerBound(new Box2D.b2Vec2(mousePosWorld.x - d, mousePosWorld.y - d));
            aabb.set_upperBound(new Box2D.b2Vec2(mousePosWorld.x + d, mousePosWorld.y + d));

            // Query the world for overlapping shapes.
            this.myQueryCallback.m_fixture = null;
            this.myQueryCallback.m_point = new Box2D.b2Vec2(mousePosWorld.x, mousePosWorld.y);
            this.world.QueryAABB(this.myQueryCallback, aabb);

            if (this.myQueryCallback.m_fixture)
            {
                var body = this.myQueryCallback.m_fixture.GetBody();
                var md = new Box2D.b2MouseJointDef();
                md.set_bodyA(this.mouseJointGroundBody);
                md.set_bodyB(body);
                md.set_target( new Box2D.b2Vec2(mousePosWorld.x, mousePosWorld.y) );
                md.set_maxForce( 1000 * body.GetMass() );
                md.set_collideConnected(true);

                this.mouseJoint = Box2D.castObject( this.world.CreateJoint(md), Box2D.b2MouseJoint );
                body.SetAwake(true);
            }
        },

        stopMouseJoint: function () {
            if ( this.mouseJoint != null ) {
                this.world.DestroyJoint(this.mouseJoint);
                this.mouseJoint = null;
            }
        },

        moveMouseJoint: function (mousePosWorld) {
            if (this.mouseJoint) {
                this.mouseJoint.SetTarget( new Box2D.b2Vec2(mousePosWorld.x, mousePosWorld.y) );
            }
        },

        step: function () {
            //this.world.Step(1/60, 3, 2);
            this.world.Step(1/120, 8, 3);
        },

        worldToScreenX: function (x) {
            return  x * this.pixelsPerMeter + this.getWorldXOffset();
        },

        worldToScreenY: function (y) {
            return  y * -this.pixelsPerMeter + this.getWorldYOffset();
        },

        screenToWorldX: function (x) {
            return (x - this.getWorldXOffset()) / this.pixelsPerMeter;
        },

        screenToWorldY: function (y) {
            return (y - this.getWorldYOffset()) / -this.pixelsPerMeter;
        },

        setWorldXOffset: function (x) {
            this.worldXOffset = x;
        },

        setWorldYOffset: function (y) {
            this.worldYOffset = y;
        },

        getWorldXOffset: function () {
            return this.worldXOffset;
        },

        getWorldYOffset: function () {
            return this.worldYOffset;
        },

        debugDraw: function () {

            this.renderContext.save();
            this.renderContext.resetTransform();
            this.renderContext.translate(this.worldXOffset, this.worldYOffset);
            //this.renderContext.translate(canvasOffset.x, canvasOffset.y);
            this.renderContext.scale(1,-1);
            this.renderContext.scale(this.pixelsPerMeter,this.pixelsPerMeter);
            this.renderContext.lineWidth /= this.pixelsPerMeter;

            this.drawAxes(this.renderContext);

            this.renderContext.fillStyle = 'rgb(255,255,0)';
            this.world.DrawDebugData();

            this.renderContext.restore();
        },

        // DEBUG DRAW STUFF - move to separate class?
        e_shapeBit: 0x0001,
        e_jointBit: 0x0002,
        e_aabbBit: 0x0004,
        e_pairBit: 0x0008,
        e_centerOfMassBit: 0x0010,

        copyVec2: function(vec) {
            return new Box2D.b2Vec2(vec.get_x(), vec.get_y());
        },

        //to replace original C++ operator * (float)
        scaleVec2: function(vec, scale) {
            vec.set_x( scale * vec.get_x() );
            vec.set_y( scale * vec.get_y() );
        },

        //to replace original C++ operator *= (float)
        scaledVec2: function(vec, scale) {
            return new Box2D.b2Vec2(scale * vec.get_x(), scale * vec.get_y());
        },

        drawAxes: function (ctx) {
            ctx.strokeStyle = 'rgb(192,0,0)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(1, 0);
            ctx.stroke();
            ctx.strokeStyle = 'rgb(0,192,0)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 1);
            ctx.stroke();
        },

        setColorFromDebugDrawCallback: function (color) {
            var col = Box2D.wrapPointer(color, Box2D.b2Color);
            var red = (col.get_r() * 255)|0;
            var green = (col.get_g() * 255)|0;
            var blue = (col.get_b() * 255)|0;
            var colStr = red+","+green+","+blue;
            this.renderContext.fillStyle = "rgba("+colStr+",0.5)";
            this.renderContext.strokeStyle = "rgb("+colStr+")";
        },

        drawSegment: function (vert1, vert2) {
            var vert1V = Box2D.wrapPointer(vert1, Box2D.b2Vec2);
            var vert2V = Box2D.wrapPointer(vert2, Box2D.b2Vec2);
            this.renderContext.beginPath();
            //this.renderContext.lineWidth(2);
            this.renderContext.moveTo(vert1V.get_x(),vert1V.get_y());
            this.renderContext.lineTo(vert2V.get_x(),vert2V.get_y());
            this.renderContext.stroke();
        },

        drawPolygon: function (vertices, vertexCount, fill) {
            this.renderContext.beginPath();
            for(tmpI=0;tmpI<vertexCount;tmpI++) {
                var vert = Box2D.wrapPointer(vertices+(tmpI*8), Box2D.b2Vec2);
                if ( tmpI == 0 )
                    this.renderContext.moveTo(vert.get_x(),vert.get_y());
                else
                    this.renderContext.lineTo(vert.get_x(),vert.get_y());
            }
            this.renderContext.closePath();
            if (fill)
                this.renderContext.fill();
            this.renderContext.stroke();
        },

        drawCircle: function (center, radius, axis, fill) {
            var centerV = Box2D.wrapPointer(center, Box2D.b2Vec2);
            var axisV = Box2D.wrapPointer(axis, Box2D.b2Vec2);
            this.renderContext.beginPath();
            this.renderContext.arc(centerV.get_x(),centerV.get_y(), radius, 0, 2 * Math.PI, false);
            if (fill)
                this.renderContext.fill();
            this.renderContext.stroke();

            if (fill) {
                //render axis marker
                var vert2V = this.copyVec2(centerV);
                vert2V.op_add( this.scaledVec2(axisV, radius) );
                this.renderContext.beginPath();
                this.renderContext.moveTo(centerV.get_x(),centerV.get_y());
                this.renderContext.lineTo(vert2V.get_x(),vert2V.get_y());
                this.renderContext.stroke();
            }
        },

        drawTransform: function (transform) {
            var trans = Box2D.wrapPointer(transform, Box2D.b2Transform);
            var pos = trans.get_p();
            var rot = trans.get_q();

            this.renderContext.save();
            this.renderContext.translate(pos.get_x(), pos.get_y());
            this.renderContext.scale(0.5,0.5);
            this.renderContext.rotate(rot.GetAngle());
            this.renderContext.lineWidth *= 2;
            this.drawAxes(this.renderContext);
            this.renderContext.restore();
        },

        getCanvasDebugDraw: function () {
            var debugDraw = new Box2D.b2Draw();

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSegment,
                replacement:
                    function(ths, vert1, vert2, color) {
                        this.setColorFromDebugDrawCallback(color);
                        this.drawSegment(vert1, vert2);
                    }.bind(this)
            }]);

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawPolygon,
                replacement:
                    function(ths, vertices, vertexCount, color) {
                        this.setColorFromDebugDrawCallback(color);
                        this.drawPolygon(vertices, vertexCount, false);
                    }.bind(this)
            }]);

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSolidPolygon,
                replacement:
                    function(ths, vertices, vertexCount, color) {
                        this.setColorFromDebugDrawCallback(color);
                        this.drawPolygon(vertices, vertexCount, true);
                    }.bind(this)
            }]);

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawCircle,
                replacement:
                    function(ths, center, radius, color) {
                        this.setColorFromDebugDrawCallback(color);
                        var dummyAxis = Box2D.b2Vec2(0,0);
                        this.drawCircle(center, radius, dummyAxis, false);
                    }.bind(this)
            }]);

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawSolidCircle,
                replacement:
                    function(ths, center, radius, axis, color) {
                        this.setColorFromDebugDrawCallback(color);
                        this.drawCircle(center, radius, axis, true);
                    }.bind(this)
            }]);

            Box2D.customizeVTable(debugDraw, [{
                original: Box2D.b2Draw.prototype.DrawTransform,
                replacement:
                    function(ths, transform) {
                        this.drawTransform(transform);
                    }.bind(this)
            }]);

            return debugDraw;
        }

    };

    return Physics;

});